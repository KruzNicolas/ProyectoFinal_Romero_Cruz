class CustomError extends Error {
  constructor(obj) {
    super(obj.message);
    this.code = obj.code;
    this.origin = obj.origin;
    this.isCustom = obj.isCustom;
  }
}

export default CustomError;
