import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, CheckSquare } from 'lucide-react';
import { ethers } from 'ethers';
import { orderService } from '../../../services/OrderService';
import contractABI from '../../../config/abi.json';
import './OrderList.css';

const CONTRACT_ADDRESS = "0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0";

const buildSellerWalletMessage = (sellerWallet, connectedWallet, action = "thực hiện thao tác này") => [
  `Tài khoản quản trị cần kết nối ví người bán trong MetaMask trước khi ${action}.`,
  `Ví người bán của đơn: ${sellerWallet || "N/A"}`,
  `Ví MetaMask hiện tại: ${connectedWallet || "chưa kết nối"}`,
  "Vui lòng mở MetaMask, chọn đúng account showroom rồi bấm lại."
].join("\n");

const getVietnameseErrorMessage = (error, fallback) => {
  const rawMessage = String(
    error?.response?.data?.message ||
    error?.reason ||
    error?.shortMessage ||
    error?.message ||
    ""
  );
  const normalized = rawMessage.toLowerCase();

  if (!rawMessage) return fallback;
  if (error?.code === "ACTION_REJECTED" || normalized.includes("user rejected")) {
    return "Bạn đã từ chối ký giao dịch trên MetaMask.";
  }
  if (normalized.includes("insufficient funds")) {
    return "Ví không đủ ETH để thanh toán phí gas hoặc thực hiện giao dịch.";
  }
  if (normalized.includes("not seller")) {
    return "Ví đang kết nối không phải ví người bán của đơn hàng này.";
  }
  if (normalized.includes("not buyer")) {
    return "Ví đang kết nối không phải ví người mua của đơn hàng này.";
  }
  if (normalized.includes("order not paid")) {
    return "Đơn hàng chưa được thanh toán trên Smart Contract.";
  }
  if (normalized.includes("invalid status")) {
    return "Trạng thái đơn hàng trên Smart Contract chưa phù hợp để thực hiện thao tác này.";
  }
  if (normalized.includes("order not found")) {
    return "Không tìm thấy đơn hàng trên Smart Contract.";
  }
  if (normalized.includes("cannot cancel now")) {
    return "Không thể hủy đơn hàng ở trạng thái hiện tại.";
  }
  if (normalized.includes("execution reverted")) {
    return "Giao dịch bị Smart Contract từ chối. Vui lòng kiểm tra trạng thái đơn hàng và ví đang kết nối.";
  }
  if (normalized.includes("network") || normalized.includes("chain")) {
    return "Mạng blockchain trên MetaMask chưa đúng. Vui lòng chuyển sang mạng Sepolia.";
  }

  return rawMessage;
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Hàm đóng/mở
  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getAllOrders();
      const ordersData = res.data || res;
      console.log("Dữ liệu đơn hàng từ API:", ordersData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      // Mock data 3 trường hợp để test giao diện
      setOrders([
        {
          _id: "69ec955f0d1a50a941398bc1", // Trường hợp 1: Đang xử lý -> Cần XÁC NHẬN
          pickupInfo: { name: "Nguyen Van A", phone: "0900000000" },
          items: [{ name: "BMW i5", price: 68000, quantity: 1 }],
          totalAmount: 68000,
          paidAmount: 340,
          buyerWallet: "0x4B69B72efe5A93686bB07aCB8554F40EEF493005",
          paymentType: "deposit",
          depositTxHash: "0x0b0eb6c94529e90975b7489721e367a70f681ff08faad94cf778c8928a9ff889",
          fullTxHash: "",
          status: "processing",
          createdAt: "2026-04-25T10:20:15.923Z",
        },
        {
          _id: "69ec955f0d1a50a941398bc2", // Trường hợp 2: Đã xác nhận -> Cần HOÀN TẤT
          pickupInfo: { name: "Le Thi B", phone: "0911111111" },
          items: [{ name: "Mercedes S500", price: 120000, quantity: 1 }],
          totalAmount: 120000,
          paidAmount: 120000,
          buyerWallet: "0x1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T",
          paymentType: "full",
          depositTxHash: "",
          fullTxHash: "0xabc123...",
          status: "confirmed",
          createdAt: "2026-04-24T10:20:15.923Z",
        },
        {
          _id: "69ec955f0d1a50a941398bc3", // Trường hợp 3: Đã hoàn tất -> ẨN NÚT
          pickupInfo: { name: "Tran Van C", phone: "0922222222" },
          items: [{ name: "Audi Q7", price: 85000, quantity: 1 }],
          totalAmount: 85000,
          paidAmount: 85000,
          buyerWallet: "0x9876543210abcdef9876543210abcdef98765432",
          paymentType: "full",
          depositTxHash: "",
          fullTxHash: "0xdef456...",
          status: "completed",
          createdAt: "2026-04-23T10:20:15.923Z",
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 1. Hàm XÁC NHẬN đơn
  const handleConfirmOrder = async (order) => {
    if (!order.blockchainOrderId) {
      return alert("Đơn hàng này chưa có mã định danh Blockchain!");
    }

    if (!order.sellerWallet) {
      return alert("Đơn hàng này chưa có địa chỉ ví người bán để xác nhận.");
    }

    if (!window.ethereum) {
      return alert("Trình duyệt chưa có MetaMask. Vui lòng cài đặt hoặc bật MetaMask để xác nhận đơn hàng.");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const connectedWallet = accounts?.[0];

      if (!connectedWallet) {
        return alert(buildSellerWalletMessage(order.sellerWallet, "", "xác nhận đơn"));
      }

      if (connectedWallet.toLowerCase() !== order.sellerWallet.toLowerCase()) {
        return alert(
          buildSellerWalletMessage(
            order.sellerWallet,
            connectedWallet,
            "xác nhận đơn"
          )
        );
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(connectedWallet);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        signer
      );

      const tx = await contract.confirmOrder(order.blockchainOrderId);
      const receipt = await tx.wait();

      if (receipt.status !== 1) {
        throw new Error("Giao dịch xác nhận trên Blockchain thất bại");
      }

      await orderService.verifySellerConfirm(order._id, tx.hash);
      alert("Xác nhận đơn hàng thành công!");
      fetchOrders();
    } catch (error) {
      console.error("Lỗi khi xác nhận đơn hàng:", error);
      alert(getVietnameseErrorMessage(error, "Có lỗi xảy ra khi xác nhận đơn hàng."));
    }
  };

  // 2. Hàm HOÀN TẤT đơn
  const handleCompleteOrder = async (order) => {
    const txHash = order.fullTxHash || order.depositTxHash;
    if (!txHash) return alert("Đơn hàng này chưa có mã giao dịch (txHash)!");

    try {
      await orderService.verifyComplete(order._id, txHash);
      alert("Hoàn tất đơn hàng thành công!");
      fetchOrders();
    } catch (error) {
      console.error("Lỗi khi hoàn tất đơn hàng:", error);
      alert(getVietnameseErrorMessage(error, "Có lỗi xảy ra khi hoàn tất đơn hàng."));
    }
  };

  // 3. Hàm HỦY đơn
  const handleCancelOrder = async (order) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    if (!order.blockchainOrderId) {
      return alert("Đơn hàng này chưa có mã định danh Blockchain!");
    }

    if (!order.sellerWallet) {
      return alert("Đơn hàng này chưa có địa chỉ ví người bán để hủy.");
    }

    if (!window.ethereum) {
      return alert("Trình duyệt chưa có MetaMask. Vui lòng cài đặt hoặc bật MetaMask để hủy đơn hàng.");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const connectedWallet = accounts?.[0];

      if (!connectedWallet) {
        return alert(buildSellerWalletMessage(order.sellerWallet, "", "hủy đơn"));
      }

      if (connectedWallet.toLowerCase() !== order.sellerWallet.toLowerCase()) {
        return alert(
          buildSellerWalletMessage(
            order.sellerWallet,
            connectedWallet,
            "hủy đơn"
          )
        );
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(connectedWallet);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI.abi,
        signer
      );

      const tx = await contract.cancelOrder(order.blockchainOrderId);
      const receipt = await tx.wait();

      if (receipt.status !== 1) {
        throw new Error("Giao dịch hủy đơn trên Blockchain thất bại");
      }

      await orderService.verifyCancel(order._id, tx.hash);
      alert("Hủy đơn hàng thành công!");
      fetchOrders();
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      alert(getVietnameseErrorMessage(error, "Có lỗi xảy ra khi hủy đơn hàng."));
    }
  };

  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pending_deposit':
        return <span className="badge badge-warning">Chờ thanh toán cọc</span>;
      case 'pending_payment':
        return <span className="badge badge-warning">Chờ thanh toán</span>;
      case 'deposit_paid':
        return <span className="badge badge-info">Đã trả cọc</span>;
      case 'processing':
        return <span className="badge badge-info">Đã trả cọc (Đang xử lý)</span>;
      case 'payment_paid':
        return <span className="badge badge-info">Đã trả thanh toán</span>;
      case 'confirmed':
        return <span className="badge badge-primary">Đã xác nhận</span>;
      case 'completed':
        return <span className="badge badge-success">Hoàn tất</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Đã hủy</span>;
      default:
        return <span className="badge" style={{ textTransform: 'capitalize' }}>{status}</span>;
    }
  };

  const formatWallet = (wallet) => {
    if (!wallet) return "Không có";
    return `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`;
  };

  return (
    <div className="order-list-container">
      <div className="page-header">
        <h2>Quản lý Đơn hàng</h2>
        <button className="refresh-btn" onClick={fetchOrders}>Làm mới</button>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ví Web3</th>
              <th>Sản phẩm</th>
              <th>Loại TT</th>
              <th>Tổng tiền</th>
              <th>Đã trả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="9" className="text-center">Đang tải dữ liệu...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="9" className="text-center">Chưa có đơn hàng nào.</td></tr>
            ) : (
              orders.map((order) => {
                const status = order.status?.toLowerCase();
                const productName = order.items?.length > 0
                  ? `${order.items[0].name} ${order.items.length > 1 ? `(+${order.items.length - 1})` : ''}`
                  : 'Không rõ';

                // Điều kiện: Đã trả tiền (>0)
                const isPaid = order.paidAmount > 0;
                const isExpanded = expandedOrderId === order._id;
                const canCancel = ['pending_deposit', 'pending_payment', 'deposit_paid'].includes(status);
                return (
                  <React.Fragment key={order._id}>
                    <tr key={order._id} className={isExpanded ? 'row-expanded' : ''}>
                      <td><strong>#{order._id.substring(0, 8)}</strong></td>
                      <td>
                        <div><strong>{order.pickupInfo?.name || "Khách ẩn danh"}</strong></div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{order.pickupInfo?.phone || ""}</div>
                      </td>
                      <td>
                        <span title={order.buyerWallet} style={{ fontFamily: 'monospace', color: '#2563eb' }}>
                          {formatWallet(order.buyerWallet)}
                        </span>
                      </td>
                      <td>{productName}</td>
                      <td style={{ textTransform: 'capitalize' }}>{order.paymentType}</td>
                      <td>${order.totalAmount?.toLocaleString('en-US')}</td>
                      <td style={{ color: '#059669', fontWeight: 'bold' }}>
                        ${order.paidAmount?.toLocaleString('en-US') || 0}
                      </td>
                      <td>{renderStatusBadge(order.status)}</td>
                      <td className="actions-cell">

                        {/* 2. NÚT XÁC NHẬN (Confirm) */}
                        {/* Hiện ra khi: Khách ĐÃ TRẢ TIỀN (cọc hoặc full) VÀ đơn hàng CHƯA được xác nhận/hoàn tất/hủy */}
                        {isPaid && (status === 'deposit_paid' || status === 'payment_paid') && (
                          <button
                            className="btn-action btn-confirm"
                            onClick={() => handleConfirmOrder(order)}
                            title="Xác nhận đã nhận tiền & chuẩn bị xe"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}

                        {/* 3. NÚT HỦY (Cancel) */}
                        {/* Smart Contract chỉ cho buyer hoặc seller hủy trước khi seller xác nhận đơn. */}
                        {canCancel && (
                          <button
                            className="btn-action btn-cancel"
                            onClick={() => handleCancelOrder(order)}
                            title="Hủy đơn & Hoàn tiền (nếu có)"
                          >
                            <XCircle size={18} />
                          </button>
                        )}

                        <button
                          className={`btn-action btn-view ${isExpanded ? 'active' : ''}`}
                          onClick={() => toggleExpand(order._id)}
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                    {/* HÀNG CHI TIẾT ĐỔ XUỐNG */}
                    {isExpanded && (
                      <tr className="detail-row">
                        <td colSpan="9">
                          <div className="order-detail-expanded">
                            <div className="detail-grid">
                              <div className="detail-section">
                                <h4>Thông tin giao dịch</h4>
                                <p><strong>Mã giao dịch (TxHash):</strong><br />
                                  <a
                                    href={`https://sepolia.etherscan.io/tx/${order.fullTxHash || order.depositTxHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {order.fullTxHash || order.depositTxHash || 'N/A'}
                                  </a>
                                </p>
                                <p><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                                <p><strong>Loại thanh toán:</strong> {order.paymentType === 'deposit' ? 'Đặt cọc' : 'Thanh toán toàn bộ'}</p>
                                <p><strong>Phương thức vẩn chuyển:</strong> {order.deliveryMethod === 'pickup' ? 'Nhận tại showroom' : 'Vận chuyển tận nhà'}</p>
                                <p>
                                  <strong>
                                    {order.deliveryMethod === 'pickup'
                                      ? `Ngày nhận: ${new Date(order.pickupInfo.pickupDate).toLocaleDateString('vi-VN')}`
                                      : `Địa chỉ: ${order.shippingAddress.address}`}
                                  </strong>
                                </p>
                              </div>

                              <div className="detail-section">
                                <h4>Danh sách sản phẩm</h4>
                                <ul className="detail-items-list">
                                  {order.items?.map((item, index) => (
                                    <li key={index}>
                                      {item.name} x {item.quantity} - <strong>${item.price?.toLocaleString()}</strong>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="detail-section">
                                <h4>Thông tin người nhận</h4>
                                <p><strong>Tên:</strong> {order.pickupInfo?.name}</p>
                                <p><strong>SĐT:</strong> {order.pickupInfo?.phone}</p>
                                <p><strong>Địa chỉ ví:</strong> {order.buyerWallet}</p>
                              </div>
                            </div>

                            {/* Có thể thêm ghi chú hoặc log trạng thái tại đây */}
                            <div className="detail-footer">
                              <small>* Dữ liệu được xác thực trên Blockchain</small>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                    }
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div >
  );
};

export default OrderList;
