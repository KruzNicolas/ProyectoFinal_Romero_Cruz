import bcrypt from "bcrypt";

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user.password);

export const handlePolicies = (policies) => {
  return async (req, res, next) => {
    if (!req.session.user)
      return res
        .status(401)
        .send({ status: "ERROR", data: "User not athorized" });

    const userRole = req.session.user.role.toUpperCase();

    policies.forEach(
      (policy, index) => (policies[index] = policies[index].toUpperCase())
    );

    if (policies.includes("PUBLIC")) return next();
    if (policies.includes(userRole)) return next();
    res.status(403).send({ status: "ERR", data: "Not enough permisions" });
  };
};

// Roles:
/*
 * PUBLIC
 * AUTH / AUTHENTICATED
 * USER / REGUAR
 * USER_PREMIUM / PREMIUM
 * ADMIN
 */
