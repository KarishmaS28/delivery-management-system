const http_codes = {
    badRequest: 400,
    internalError: 500,
    created: 201,
    notFound: 404,
    ok: 200,
    notImplemented: 501,
    forbidden: 403,
    unAuthorized: 401,
    Conflict: 409,
};

const messages = {
    success: 'success',
    badRequest: 'Bad request',
    userAlreadyExist: 'Email already registered',
    invalidCredentials: 'Invalid credentials',
    orderNotFound: 'Order not found',
    driverNotFound: 'Driver not found',
    onlyPendingAssign: 'Order already assigned',
    orderNotAssigned: 'Order not assigned to you',
    tokenNotProvided:'No token provided',
    invalidExpiredToken:'Invalid or expired token',
    accessDenied:'Access denied'
};

const roles = {
    customer: 'customer',
    driver: 'driver',
    admin: 'admin',
};

const ORDER_STATUS = {
    pending: 'pending',
    assigned: 'assigned',
    picked: 'picked',
    delivered: 'delivered',
};

const STATUS_TRANSITIONS = { pending: 'assigned', assigned: 'picked', picked: 'delivered' };


const schemas = {
    users: "users",
    orders: "orders",
    deliveries:"deliveries",
    



}

module.exports = {
    http_codes,
    messages,
    roles,
    ORDER_STATUS,
    STATUS_TRANSITIONS,
    schemas
};
