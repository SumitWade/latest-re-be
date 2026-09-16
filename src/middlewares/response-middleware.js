const responseMiddleware = (request, response, next) => {
  //only success response msg FOR GET
  response.ok = (message = 'Data fetched successfully.') => {
    return response.status(200).json({
      status: 'SUCCESS',
      message,
    });
  };

  //success response msg FOR POST in create update
  response.success = (message, result) => {
    return response.status(200).json({
      status: 'SUCCESS',
      message,
      result: result || null,
    });
  };

  //all paginated response
  response.paginated = (data, totalPages = 0, totalRecords = 0, message = 'Data fetched successfully.') => {
    return response.status(200).json({
      status: 'SUCCESS',
      message,
      totalPages,
      totalRecords,
      result: data,
    });
  };

  //Failed error response handle
  // 400 Bad Request
  // when to use Missing required fields, Invalid format, Validation failed, Wrong input values
  response.badRequest = (message = 'Invalid request') => {
    return response.status(400).json({
      status: 'FAILED',
      message,
    });
  };

  // 401 Unauthorized
  response.unauthorized = (status, message) => {
    return response.status(401).json({
      status,
      message,
    });
  };

  // 404 Not Found
  // used when data not found
  response.notFound = (message) => {
    return response.status(404).json({
      status: 'FAILED',
      message,
    });
  };

  // 403 Forbidden
  response.forbidden = (message) => {
    return response.status(403).json({
      status: 'FAILED',
      message: message || 'Access denied',
    });
  };

  // 409 Conflict
  // used on all duplicates, already exist
  response.conflict = (message) => {
    return response.status(409).json({
      status: 'FAILED',
      message,
    });
  };

  // 422 Validation Error
  response.validationError = (checkError) => {
    return response.status(422).json({
      status: 'FAILED',
      message: `Validation failed ${checkError}`,
    });
  };

  // 500 Internal Server Error
  response.error = (error) => {
    return response.status(500).json({
      status: 'FAILED',
      message: error?.message || error,
    });
  };

  next();
};

module.exports = responseMiddleware;
