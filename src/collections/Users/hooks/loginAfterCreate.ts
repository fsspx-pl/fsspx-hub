import { CollectionAfterChangeHook } from "payload";

export const loginAfterCreate: CollectionAfterChangeHook = async ({
  doc,
  req,
  req: { data, payload },
  operation,
}) => {
  if (operation === "create" && !req.user && data) {
    const { email, password } = data;
    if (email && password) {
      const { user, token } = await payload.login({
        collection: "users",
        data: { email: email as string, password: password as string },
        req,
      });

      return {
        ...doc,
        token,
        user,
      };
    }
  }

  return doc;
};
