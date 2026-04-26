import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { ethers } from "ethers";
import Navbar from "../../components/Navbar/Navbar";
import { orderService } from "../../services/orderService";
import contractArtifact from "../../config/abi.json";
import "./MyOrders.css";

const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0";
const USD_PER_ETH = Number(import.meta.env.VITE_USD_PER_ETH || 2000000);
const SEPOLIA_CHAIN_ID = 11155111n;
const SEPOLIA_CHAIN_HEX = "0xaa36a7";

const STATUS_CONFIG = {
  pending_deposit: {
    label: "Chờ đặt cọc",
    tone: "warning",
    description: "Đơn đã được tạo, bạn cần hoàn tất giao dịch đặt cọc.",
  },
  pending_payment: {
    label: "Chờ thanh toán",
    tone: "warning",
    description: "Đơn đang chờ thanh toán hoặc chờ showroom xác nhận giao dịch.",
  },
  deposit_paid: {
    label: "Đã đặt cọc",
    tone: "info",
    description: "Tiền cọc đã được xác minh, đơn đang chờ showroom xác nhận.",
  },
  processing: {
    label: "Đang xử lý",
    tone: "primary",
    description: "Showroom đã xác nhận. Sau khi nhận xe, bạn có thể hoàn tất giao dịch.",
  },
  completed: {
    label: "Hoàn tất",
    tone: "success",
    description: "Giao dịch đã hoàn tất và được ghi nhận trên hệ thống.",
  },
  cancelled: {
    label: "Đã hủy",
    tone: "danger",
    description: "Đơn hàng đã được hủy.",
  },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const shortText = (value, start = 8, end = 6) => {
  if (!value) return "Chưa có";
  return `${String(value).slice(0, start)}...${String(value).slice(-end)}`;
};

const getErrorMessage = (error) => {
  const raw = String(
    error?.response?.data?.message ||
    error?.reason ||
    error?.shortMessage ||
    error?.message ||
    ""
  );
  const normalized = raw.toLowerCase();

  if (!raw) return "Có lỗi xảy ra khi xử lý giao dịch.";
  if (error?.code === "ACTION_REJECTED" || normalized.includes("user rejected")) {
    return "Bạn đã từ chối ký giao dịch trên MetaMask.";
  }
  if (normalized.includes("insufficient funds")) {
    return "Ví không đủ ETH để thanh toán hoặc trả phí gas.";
  }
  if (normalized.includes("not buyer")) {
    return "Ví MetaMask hiện tại không phải ví người mua của đơn hàng này.";
  }
  if (normalized.includes("cannot cancel now")) {
    return "Đơn hàng không còn ở trạng thái có thể hủy.";
  }
  if (normalized.includes("order not confirmed")) {
    return "Đơn hàng chưa được showroom xác nhận nên chưa thể hoàn tất.";
  }
  return raw;
};

const getFullPaymentWei = (order) => {
  const ethAmount = (Number(order.totalAmount || 0) / USD_PER_ETH).toFixed(18);
  return ethers.parseEther(ethAmount);
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      const list = Array.isArray(response) ? response : response?.data || [];
      setOrders(list);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesKeyword =
        !keyword ||
        [
          order._id,
          order.blockchainOrderId,
          order.buyerWallet,
          order.sellerWallet,
          ...(order.items || []).map((item) => item.name),
        ].some((value) => String(value || "").toLowerCase().includes(keyword));

      return matchesStatus && matchesKeyword;
    });
  }, [orders, searchTerm, statusFilter]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      waiting: orders.filter((order) =>
        ["pending_deposit", "pending_payment", "deposit_paid"].includes(order.status)
      ).length,
      processing: orders.filter((order) => order.status === "processing").length,
      completed: orders.filter((order) => order.status === "completed").length,
    }),
    [orders]
  );

  const getContract = async (order) => {
    if (!window.ethereum) {
      throw new Error("Trình duyệt chưa cài MetaMask.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();

    if (network.chainId !== SEPOLIA_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_HEX }],
        });
      } catch (switchError) {
        if (switchError?.code !== 4902) throw switchError;
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_HEX,
              chainName: "Sepolia",
              nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      }
    }

    const signer = await provider.getSigner();
    const connectedWallet = await signer.getAddress();

    if (
      order.buyerWallet &&
      connectedWallet.toLowerCase() !== order.buyerWallet.toLowerCase()
    ) {
      throw new Error("Ví MetaMask hiện tại không phải ví người mua của đơn hàng này.");
    }

    return new ethers.Contract(CONTRACT_ADDRESS, contractArtifact.abi, signer);
  };

  const runOrderAction = async (order, action, handler) => {
    if (actionState) return;
    try {
      setActionState({ orderId: order._id, action });
      await handler();
      await fetchOrders();
    } catch (error) {
      console.error("Lỗi xử lý đơn hàng:", error);
      alert(getErrorMessage(error));
    } finally {
      setActionState(null);
    }
  };

  const handlePayDeposit = (order) => {
    runOrderAction(order, "payDeposit", async () => {
      const contract = await getContract(order);
      const tx = await contract.payDeposit(order.blockchainOrderId, {
        value: ethers.toBigInt(order.depositAmountWei),
      });
      await tx.wait();
      await orderService.verifyDeposit(order._id, tx.hash);
      alert("Đặt cọc thành công! Đơn hàng đang chờ showroom xác nhận.");
    });
  };

  const handlePayFull = (order) => {
    runOrderAction(order, "payFull", async () => {
      const contract = await getContract(order);
      const tx = await contract.payFull(order.blockchainOrderId, {
        value: getFullPaymentWei(order),
      });
      await tx.wait();
      await orderService.verifyFullPayment(order._id, tx.hash);
      alert("Thanh toán thành công! Đơn hàng đang chờ showroom xác nhận.");
    });
  };

  const handleComplete = (order) => {
    if (!window.confirm("Bạn xác nhận đã nhận xe và muốn hoàn tất giao dịch?")) return;
    runOrderAction(order, "complete", async () => {
      const contract = await getContract(order);
      const tx = await contract.completeOrder(order.blockchainOrderId);
      await tx.wait();
      await orderService.verifyComplete(order._id, tx.hash);
      alert("Giao dịch đã hoàn tất thành công!");
    });
  };

  const handleCancel = (order) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    runOrderAction(order, "cancel", async () => {
      const contract = await getContract(order);
      const tx = await contract.cancelOrder(order.blockchainOrderId);
      await tx.wait();
      await orderService.verifyCancel(order._id, tx.hash);
      alert("Hủy đơn hàng thành công!");
    });
  };

  const renderAction = (order) => {
    const isRunning = actionState?.orderId === order._id;
    const paidFullWaiting =
      order.status === "pending_payment" && (order.fullTxHash || Number(order.paidAmount) > 0);

    if (order.status === "pending_deposit") {
      return (
        <button className="order-action primary" onClick={() => handlePayDeposit(order)} disabled={Boolean(actionState)}>
          {isRunning && actionState.action === "payDeposit" ? <LoaderCircle className="spin-icon" size={17} /> : <Wallet size={17} />}
          Đặt cọc
        </button>
      );
    }

    if (order.status === "pending_payment" && !paidFullWaiting) {
      return (
        <button className="order-action primary" onClick={() => handlePayFull(order)} disabled={Boolean(actionState)}>
          {isRunning && actionState.action === "payFull" ? <LoaderCircle className="spin-icon" size={17} /> : <CreditCard size={17} />}
          Thanh toán
        </button>
      );
    }

    if (order.status === "processing") {
      return (
        <button className="order-action success" onClick={() => handleComplete(order)} disabled={Boolean(actionState)}>
          {isRunning && actionState.action === "complete" ? <LoaderCircle className="spin-icon" size={17} /> : <PackageCheck size={17} />}
          Đã nhận xe
        </button>
      );
    }

    return null;
  };

  const canCancel = (order) =>
    ["pending_deposit", "pending_payment", "deposit_paid"].includes(order.status);

  return (
    <>
      <Navbar />
      <main className="my-orders-page">
        <header className="my-orders-header">
          <div>
            <p className="my-orders-eyebrow">Lịch sử giao dịch</p>
            <h1>Đơn hàng của tôi</h1>
            <p>Theo dõi trạng thái, txHash và hoàn tất giao dịch sau khi nhận xe.</p>
          </div>
          <button className="refresh-orders-btn" onClick={fetchOrders} disabled={loading || Boolean(actionState)}>
            <RefreshCw size={17} className={loading ? "spin-icon" : ""} />
            Làm mới
          </button>
        </header>

        <section className="order-stats-grid">
          <StatCard icon={<Clock3 size={22} />} label="Tổng đơn" value={stats.total} />
          <StatCard icon={<Wallet size={22} />} label="Đang chờ" value={stats.waiting} />
          <StatCard icon={<ShieldCheck size={22} />} label="Đang xử lý" value={stats.processing} />
          <StatCard icon={<CheckCircle2 size={22} />} label="Hoàn tất" value={stats.completed} />
        </section>

        <section className="my-orders-toolbar">
          <div className="order-search-box">
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo mã đơn, ví, tên xe..."
            />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status}>
                {config.label}
              </option>
            ))}
          </select>
        </section>

        <section className="my-orders-list">
          {loading ? (
            <div className="orders-empty">
              <LoaderCircle className="spin-icon" size={24} />
              Đang tải đơn hàng...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="orders-empty">Bạn chưa có đơn hàng phù hợp.</div>
          ) : (
            filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_deposit;
              const isExpanded = expandedOrderId === order._id;
              const isRunning = actionState?.orderId === order._id;
              const txHash = order.fullTxHash || order.depositTxHash;

              return (
                <article className={`my-order-card ${isRunning ? "is-processing" : ""}`} key={order._id}>
                  <div className="order-card-main">
                    <div className="order-card-left">
                      <div className="order-id-row">
                        <strong>#{order._id.slice(-8)}</strong>
                        <span className={`order-status-pill ${config.tone}`}>{config.label}</span>
                      </div>
                      <h2>{order.items?.[0]?.name || "Đơn hàng xe"}</h2>
                      <p>{order.items?.length || 0} sản phẩm · Blockchain ID {order.blockchainOrderId}</p>
                    </div>

                    <div className="order-money-box">
                      <span>Tổng giá trị</span>
                      <strong>{formatCurrency(order.totalAmount)}</strong>
                      <small>Đã thanh toán: {formatCurrency(order.paidAmount)}</small>
                    </div>

                    <div className="order-card-actions">
                      {renderAction(order)}
                      {canCancel(order) && (
                        <button className="order-action danger" onClick={() => handleCancel(order)} disabled={Boolean(actionState)}>
                          {isRunning && actionState.action === "cancel" ? <LoaderCircle className="spin-icon" size={17} /> : <Ban size={17} />}
                          Hủy đơn
                        </button>
                      )}
                      <button className="order-action ghost" onClick={() => setExpandedOrderId(isExpanded ? "" : order._id)}>
                        <ChevronDown size={17} className={isExpanded ? "rotated" : ""} />
                        Chi tiết
                      </button>
                    </div>
                  </div>

                  <div className="order-progress">
                    <ProgressStep done label="Tạo đơn" />
                    <ProgressStep done={["deposit_paid", "processing", "completed"].includes(order.status) || Boolean(order.fullTxHash)} label="Thanh toán" />
                    <ProgressStep done={["processing", "completed"].includes(order.status)} label="Showroom xác nhận" />
                    <ProgressStep done={order.status === "completed"} label="Hoàn tất" />
                  </div>

                  <p className="order-status-note">{config.description}</p>

                  {isExpanded && (
                    <div className="order-detail-panel">
                      <div>
                        <h3>Sản phẩm</h3>
                        <ul className="order-items">
                          {(order.items || []).map((item) => (
                            <li key={`${item.productId}-${item.name}`}>
                              <span>{item.name} x {item.quantity}</span>
                              <strong>{formatCurrency(item.price)}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3>Nhận xe</h3>
                        <p>{order.deliveryMethod === "pickup" ? "Nhận tại showroom" : "Giao xe tận nơi"}</p>
                        <p>{order.pickupInfo?.name || order.shippingAddress?.name}</p>
                        <p>{order.pickupInfo?.phone || order.shippingAddress?.phone}</p>
                        {order.shippingAddress?.address && <p>{order.shippingAddress.address}</p>}
                        {order.pickupInfo?.pickupDate && <p>Ngày hẹn: {new Date(order.pickupInfo.pickupDate).toLocaleDateString("vi-VN")}</p>}
                      </div>

                      <div>
                        <h3>Blockchain</h3>
                        <p>Ví người mua: <span title={order.buyerWallet}>{shortText(order.buyerWallet, 6, 4)}</span></p>
                        <p>Ví showroom: <span title={order.sellerWallet}>{shortText(order.sellerWallet, 6, 4)}</span></p>
                        <p>Loại thanh toán: {order.paymentType === "deposit" ? "Đặt cọc" : "Thanh toán toàn phần"}</p>
                        <p>Tiền cọc: {formatCurrency(order.depositAmount)}</p>
                        {txHash ? (
                          <a className="tx-link" href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
                            {shortText(txHash, 10, 8)}
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <p>TxHash: Chưa có</p>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      </main>
    </>
  );
}

const StatCard = ({ icon, label, value }) => (
  <article className="my-orders-stat-card">
    <div>{icon}</div>
    <span>{label}</span>
    <strong>{value}</strong>
  </article>
);

const ProgressStep = ({ label, done }) => (
  <div className={`progress-step ${done ? "done" : ""}`}>
    <span />
    <p>{label}</p>
  </div>
);

export default MyOrders;
