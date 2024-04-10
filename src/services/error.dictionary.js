const errorDictionary = {
  ROUTING_ERROR: { code: 404, message: "Request endpoint not found" },
  FEW_PARAMETERS: {
    code: 400,
    message: "Some parameters are missing or required",
  },
  INVALID_MONGOID_FORMAT: { code: 400, message: "Invalid MongoId format" },
  INVALID_PARAMETER: { code: 400, message: "Invalid parameter" },
  INVALID_TYPE_ERROR: { code: 400, message: "Invalid type error" },
  ID_NOT_FOUND: { code: 400, message: "Id not found" },
  DATABASE_ERROR: { code: 500, message: "Can't connect to data base" },
  INTERNAL_ERROR: { code: 500, message: "Internal error" },
};

export default errorDictionary;
