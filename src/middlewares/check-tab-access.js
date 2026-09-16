const checkTabAccess = (tabName, requiredAccess) => {
  return (request, response, next) => {
    try {
      //extract tab access from  request
      const { tabAccess } = request;

      // Check if the user has access
      const tab = tabAccess?.find((ele) => ele?.tabName === tabName);
      if (!tab || tab.access !== requiredAccess) {
        return response.status(200).json({
          status: 'FAILED',
          message: 'You do not have access to this tab',
        });
      }
      next();
    } catch (error) {
      return response.status(500).json({
        status: 'FAILED',
        message: error.message,
      });
    }
  };
};

module.exports = checkTabAccess;
