// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract VehicleMarketplaceEscrow {
    enum PaymentType {
        None,
        Deposit,
        Full
    }

    enum OrderStatus {
        None,
        Pending,
        DepositPaid,
        FullPaid,
        Confirmed,
        Completed,
        Cancelled
    }

    struct Order {
        uint256 orderId;
        address buyer;
        address seller;
        uint256 totalAmount;
        uint256 depositAmount;
        uint256 paidAmount;
        PaymentType paymentType;
        OrderStatus status;
        uint256 createdAt;
    }

    mapping(uint256 => Order) public orders;

    event OrderCreated(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 totalAmount,
        uint256 depositAmount,
        PaymentType paymentType
    );

    event DepositPaid(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event FullPaid(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event SellerConfirmed(uint256 indexed orderId, address indexed seller);
    event OrderCompleted(uint256 indexed orderId, address indexed buyer, uint256 releasedAmount);
    event OrderCancelled(uint256 indexed orderId, address indexed caller, uint256 refundedAmount);

    modifier onlyBuyer(uint256 orderId) {
        require(msg.sender == orders[orderId].buyer, "Not buyer");
        _;
    }

    modifier onlySeller(uint256 orderId) {
        require(msg.sender == orders[orderId].seller, "Not seller");
        _;
    }

    modifier orderExists(uint256 orderId) {
        require(orders[orderId].orderId != 0, "Order not found");
        _;
    }

    function createOrder(
        uint256 orderId,
        address buyer,
        address seller,
        uint256 totalAmount,
        uint256 depositAmount,
        PaymentType paymentType
    ) external {
        require(orderId != 0, "Invalid orderId");
        require(buyer != address(0), "Invalid buyer");
        require(seller != address(0), "Invalid seller");
        require(totalAmount > 0, "Invalid total amount");
        require(orders[orderId].orderId == 0, "Order already exists");

        if (paymentType == PaymentType.Deposit) {
            require(depositAmount > 0, "Invalid deposit amount");
            require(depositAmount < totalAmount, "Deposit must be less than total");
        } else if (paymentType == PaymentType.Full) {
            require(depositAmount == 0, "Full payment deposit must be 0");
        } else {
            revert("Invalid payment type");
        }

        orders[orderId] = Order({
            orderId: orderId,
            buyer: buyer,
            seller: seller,
            totalAmount: totalAmount,
            depositAmount: depositAmount,
            paidAmount: 0,
            paymentType: paymentType,
            status: OrderStatus.Pending,
            createdAt: block.timestamp
        });

        emit OrderCreated(orderId, buyer, seller, totalAmount, depositAmount, paymentType);
    }

    function payDeposit(uint256 orderId) external payable orderExists(orderId) onlyBuyer(orderId) {
        Order storage order = orders[orderId];

        require(order.paymentType == PaymentType.Deposit, "Not deposit order");
        require(order.status == OrderStatus.Pending, "Invalid status");
        require(msg.value == order.depositAmount, "Incorrect deposit amount");

        order.paidAmount = msg.value;
        order.status = OrderStatus.DepositPaid;

        emit DepositPaid(orderId, msg.sender, msg.value);
    }

    function payFull(uint256 orderId) external payable orderExists(orderId) onlyBuyer(orderId) {
        Order storage order = orders[orderId];

        require(order.paymentType == PaymentType.Full, "Not full payment order");
        require(order.status == OrderStatus.Pending, "Invalid status");
        require(msg.value == order.totalAmount, "Incorrect full amount");

        order.paidAmount = msg.value;
        order.status = OrderStatus.FullPaid;

        emit FullPaid(orderId, msg.sender, msg.value);
    }

    function confirmOrder(uint256 orderId) external orderExists(orderId) onlySeller(orderId) {
        Order storage order = orders[orderId];

        require(
            order.status == OrderStatus.DepositPaid || order.status == OrderStatus.FullPaid,
            "Order not paid"
        );

        order.status = OrderStatus.Confirmed;

        emit SellerConfirmed(orderId, msg.sender);
    }

    function completeOrder(uint256 orderId) external orderExists(orderId) onlyBuyer(orderId) {
        Order storage order = orders[orderId];

        require(order.status == OrderStatus.Confirmed, "Order not confirmed");

        order.status = OrderStatus.Completed;

        uint256 releaseAmount = order.paidAmount;
        order.paidAmount = 0;

        payable(order.seller).transfer(releaseAmount);

        emit OrderCompleted(orderId, msg.sender, releaseAmount);
    }

    function cancelOrder(uint256 orderId) external orderExists(orderId) {
        Order storage order = orders[orderId];

        require(
            msg.sender == order.buyer || msg.sender == order.seller,
            "Not authorized"
        );
        require(
            order.status == OrderStatus.Pending ||
            order.status == OrderStatus.DepositPaid ||
            order.status == OrderStatus.FullPaid,
            "Cannot cancel now"
        );

        uint256 refundAmount = order.paidAmount;
        order.paidAmount = 0;
        order.status = OrderStatus.Cancelled;

        if (refundAmount > 0) {
            payable(order.buyer).transfer(refundAmount);
        }

        emit OrderCancelled(orderId, msg.sender, refundAmount);
    }

    function getOrder(uint256 orderId)
        external
        view
        returns (
            uint256,
            address,
            address,
            uint256,
            uint256,
            uint256,
            PaymentType,
            OrderStatus,
            uint256
        )
    {
        Order memory order = orders[orderId];
        return (
            order.orderId,
            order.buyer,
            order.seller,
            order.totalAmount,
            order.depositAmount,
            order.paidAmount,
            order.paymentType,
            order.status,
            order.createdAt
        );
    }
}