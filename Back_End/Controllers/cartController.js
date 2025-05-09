import db from "../Service/database.js";
import jwt from "jsonwebtoken";

export async function checkCart(req, res) {
  console.log(`POST CART customer  is requested`);
  // ก่อนจะ Excuese Query ทำการ Validate Data ก่อน
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];
  console.log(token);
  if (!token) {
    return res.status(401).json({
      error: "Unauthorized - No token provided",
    });
  }
  const secret_key = process.env.SECRET_KEY;
  console.log(secret_key);
  let decoded;
  try {
    console.log(`decoded`);
    decoded = jwt.verify(token, secret_key);
    console.log(decoded);
  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized - Invalid token",
    });
  }
  // ค้นหาข้อมูลผู้ใช้จาก decoded Email
  const userResult = await db.query(`SELECT * FROM members WHERE "memEmail" = $1`, [decoded.Email]);
  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }
  const userId = userResult.rows[0].id;
  const result = await db.query({
    text: `SELECT * FROM carts WHERE "userId" = $1 AND "is_succ" != true `,
    values: [userId],
  });
  if (result.rows[0] != null) {
    return res.json({
      status: 200,
      cartExist: true,
      cartId: result.rows[0].cart_id,
    });
  } else {
    return res.json({ cartExist: false });
  }
}

export async function addCart(req, res) {
  console.log(`POST /CART is requested`);
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    console.log(token);
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }
    const secret_key = process.env.SECRET_KEY;
    console.log(secret_key);
    let decoded;
    try {
      console.log(`decoded`);
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    // ดึง userId จากฐานข้อมูล โดยใช้ email จาก token
    const queryUser = `SELECT id FROM members WHERE "memEmail" = $1`;
    const resultUser = await db.query(queryUser, [decoded.Email]);

    if (resultUser.rows.length === 0) {
      return res.status(400).json({
        cartOK: false,
        messageAddCart: "User not found",
      });
    }

    const userId = resultUser.rows[0].id; // ดึง id จากตาราง members

    // Gen ID
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const currentDate = `${year}${month}${day}`;

    const queryGenId = `SELECT CONCAT(
                        TO_CHAR(NOW(), 'YYYYMMDD'), 
                        '-', 
                        LPAD(
                          COALESCE(MAX(CAST(SUBSTRING(cart_id, 10) AS INT)) + 1, 1)::TEXT, 4, '0'
                        )
                      ) AS new_cart_id
                      FROM carts 
                      WHERE cart_id LIKE CONCAT(TO_CHAR(NOW(), 'YYYYMMDD'), '-%');
    `;
    const resultGen = await db.query(queryGenId);
    if (resultGen.rows.length > 0) {
      console.log(`resultGen=${resultGen.rows[0].new_cart_id}`);
    } else {
      console.log("No results found");
    }

    const queryCheckCartId = `SELECT "cart_id" FROM carts WHERE "cart_id" = $1`;
    const resultCheckCartId = await db.query(queryCheckCartId, [
      resultGen.rows[0].new_cart_id,
    ]);

    if (resultCheckCartId.rows.length > 0) {
      return res.status(400).json({
        cartOK: false,
        messageAddCart: "Cart ID already exists",
      });
    }

    // ได้ id แล้ว ทำการบันทึกข้อมูลลงตะกร้า
    const result = await db.query(
      `INSERT INTO carts ("id", "cart_id", "userId", "create_date") VALUES (nextval('cart_id_seq'), $1, $2, $3) `,
      [
        resultGen.rows[0].new_cart_id, // $1 รหัสที่ Gen มา
        userId, // $2 userId ที่ดึงจากฐานข้อมูล
        now, // $3 วันปัจจุบัน
      ]
    );

    return res.json({ cartOK: true, cartId: resultGen.rows[0].new_cart_id });
  } catch (err) {
    return res.json({ cartOK: false, messageAddCart: err.message });
  }
}
export async function addCartDtl(req, res) {
  console.log(`POST /CARTDETAIL is requested`);
  try {
    // ก่อนจะ Excuese Query ทำการ Validate Data ก่อน
    if (req.body.cart_id == null || req.body.product_id == null) {
      return res.json({
        cartDtlOK: false,
        messageAddCartDtl: "CartId && ProductID  is required",
      });
    }

    // ดูว่ามี Product เดิมอยู่หรือไม่
    const pdResult = await db.query(
      `SELECT * FROM "cart_items" ctd WHERE ctd."cart_id" = $1 AND ctd."product_id" = $2`,
      [req.body.cart_id, req.body.product_id] //ค่า Parameter ที่ส่งมา
    );
    console.log(`pdResult.rowCount=${pdResult.rowCount}`);
    
    if (pdResult.rowCount == 0) {
      // ถ้าไม่มีให้ INSERT
      try {
        const result = await db.query(
          `INSERT INTO "cart_items" ("item_id", "cart_id", "product_id", "quantity")
           VALUES (nextval('item_id_seq'), $1, $2, $3)`,
          [req.body.cart_id, req.body.product_id, 1]
        );
        
        // เช็คว่าการ insert สำเร็จหรือไม่
        if (result.rowCount > 0) {
          return res.json({ cartDtlOK: true, messageAddCart: req.body.cart_id });
        } else {
          return res.json({
            cartDtlOK: false,
            messageAddCartDtl: "Failed to insert detail",
          });
        }
      } catch (err) {
        console.error("Error during INSERT: ", err.message);
        return res.json({
          cartDtlOK: false,
          messageAddCartDtl: "INSERT DETAIL ERROR: " + err.message,
        });
      }
    } else {
      // ถ้ามีแล้วให้ UPDATE
      try {
        const result = await db.query(
          `UPDATE "cart_items" 
           SET "quantity" = $1
           WHERE "cart_id" = $2
           AND "product_id" = $3`,
          [pdResult.rows[0].quantity + 1, req.body.cart_id, req.body.product_id]
        );

        if (result.rowCount > 0) {
          return res.json({ cartDtlOK: true, messageAddCart: req.body.cart_id });
        } else {
          return res.json({
            cartDtlOK: false,
            messageAddCartDtl: "Failed to update detail",
          });
        }
      } catch (err) {
        console.error("Error during UPDATE: ", err.message);
        return res.json({
          cartDtlOK: false,
          messageAddCartDtl: "UPDATE DETAIL ERROR: " + err.message,
        });
      }
    }
  } catch (err) {
    console.error("Error in addCartDtl function: ", err.message);
    return res.json({
      cartDtlOK: false,
      messageAddCartDtl: "General error: " + err.message,
    });
  }
}

export async function getCartByCus(req, res) {
  console.log(`POST Cart By Customer is Requested`);
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];  // ดึง token ออกจาก Authorization header

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }

    const secret_key = process.env.SECRET_KEY;
    let decoded;

    try {
      // ตรวจสอบ JWT token
      decoded = jwt.verify(token, secret_key);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }
    // ค้นหาข้อมูลผู้ใช้จาก decoded Email
    const userResult = await db.query(`SELECT * FROM members WHERE "memEmail" = $1`, [decoded.Email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;
    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const queryUserData = `SELECT "id", "memEmail" FROM members WHERE "id" = $1`;
    const resultUser = await db.query(queryUserData, [userId]);

    if (resultUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = resultUser.rows[0];

    // ดึงข้อมูลตะกร้าสินค้าที่ยังไม่สมบูรณ์
    const queryListCart = `SELECT ct."cart_id" 
                           FROM carts ct 
                           WHERE ct."userId" = $1 AND ct."is_succ" != true 
                           ORDER BY ct."id" DESC`;
    const resultCart = await db.query(queryListCart, [userId]);

    const cartList = {};

    // สำหรับแต่ละตะกร้า
    for (const cart of resultCart.rows) {
      const cartId = cart.cart_id;

      // ดึงข้อมูลสรุปตะกร้า
      const queryCartSum = `SELECT SUM(ctd."quantity") AS qty, 
                                   SUM(ctd."quantity" * pd."product_price") AS money
                            FROM "cart_items" ctd 
                            LEFT JOIN "products" pd ON ctd."product_id" = pd."product_id"
                            WHERE ctd."cart_id" = $1
                            GROUP BY ctd."cart_id"`;
      const resultCartSum = await db.query(queryCartSum, [cartId]);

      // ดึงข้อมูลสินค้าในตะกร้า
      const queryCartItems = `SELECT ctd."product_id", 
                                     pd."product_name", 
                                     ctd."quantity" AS qty, 
                                     pd."product_price" AS price, 
                                     (ctd."quantity" * pd."product_price") AS total
                              FROM "cart_items" ctd 
                              LEFT JOIN "products" pd ON ctd."product_id" = pd."product_id"
                              WHERE ctd."cart_id" = $1`;
      const resultCartItems = await db.query(queryCartItems, [cartId]);

      const productList = {};
      resultCartItems.rows.forEach((item) => {
        productList[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product_name,
          qty: item.qty,
          price: item.price,
          Total: item.total,
        };
      });

      // ตรวจสอบว่ามีสินค้าในตะกร้าหรือไม่
      if (resultCartSum.rows.length > 0 && resultCartItems.rows.length > 0) {
        cartList[cartId] = {
          qty: resultCartSum.rows[0].qty,
          total: resultCartSum.rows[0].money,
          productList: productList,
        };
      } else {
        // หากตะกร้าว่างเปล่า
        cartList[cartId] = {
          qty: 0,
          total: 0,
          productList: {},
        };
      }
    }

    // ส่งผลลัพธ์กลับ
    return res.json({
      status: 200,
      data: {
        cartList: cartList,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getCartHistoryByCus(req, res) {
  console.log(`POST CartHistory By Customer is Requested`);
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }
    const secret_key = process.env.SECRET_KEY;
    console.log(secret_key);
    let decoded;
    try {
      console.log(`decoded`);
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }
    // ค้นหาข้อมูลผู้ใช้จาก decoded Email
    const userResult = await db.query(`SELECT * FROM members WHERE "memEmail" = $1`, [decoded.Email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;
    const queryUserData = `SELECT "id", "memEmail" FROM members WHERE "id" = $1`;
    const resultUser = await db.query(queryUserData, [userId]);

    if (resultUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = resultUser.rows[0];
    console.log(`userData=${userData}`);
    // ดึงข้อมูลตะกร้าสินค้าที่ยังไม่สมบูรณ์
    const queryListCart = `SELECT ct."cart_id" 
                           FROM carts ct 
                           WHERE ct."userId" = $1 AND ct."is_succ" = true 
                           ORDER BY ct."id" DESC`;
    const resultCart = await db.query(queryListCart, [userId]);

    const cartList = {};

    // สำหรับแต่ละตะกร้า
    for (const cart of resultCart.rows) {
      const cartId = cart.cart_id;
      console.log(`cartId=${cartId}`);
      // ดึงข้อมูลสรุปตะกร้า
      const queryCartSum = `SELECT SUM(ctd."quantity") AS qty, 
                                   SUM(ctd."quantity" * pd."product_price") AS money
                            FROM "cart_items" ctd 
                            LEFT JOIN "products" pd ON ctd."product_id" = pd."product_id"
                            WHERE ctd."cart_id" = $1
                            GROUP BY ctd."cart_id"`;
      const resultCartSum = await db.query(queryCartSum, [cartId]);
      console.log(`resultCartSum=${resultCartSum.rows}`);
      // ดึงข้อมูลสินค้าในตะกร้า
      const queryCartItems = `SELECT ctd."product_id", 
                                     pd."product_name", 
                                     ctd."quantity" AS qty, 
                                     pd."product_price" AS price, 
                                     (ctd."quantity" * pd."product_price") AS total
                              FROM "cart_items" ctd 
                              LEFT JOIN "products" pd ON ctd."product_id" = pd."product_id"
                              WHERE ctd."cart_id" = $1`;
      const resultCartItems = await db.query(queryCartItems, [cartId]);
      console.log(`resultCartItems=${resultCartItems.rows}`);

      const productList = {};
      resultCartItems.rows.forEach((item) => {
        productList[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product_name,
          qty: item.qty,
          price: item.price,
          Total: item.total,
        };
      });

      cartList[cartId] = {
        qty: resultCartSum.rows[0].qty,
        total: resultCartSum.rows[0].money,
        productList: productList,
      };
    }
    console.log(`cartList=${cartList}`);
    // ส่งผลลัพธ์กลับ
    return res.json({
      status: 200,
      data: {
        // id: userData.id,
        // email: userData.memEmail,
        cartList: cartList,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateCartItemQty(req, res) {
  console.log(`POST Update Cart Item Qty is Requested`);
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }

    const secret_key = process.env.SECRET_KEY;
    let decoded;
    try {
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    // ค้นหาข้อมูล user จาก decoded Email
    const userResult = await db.query(`SELECT * FROM members WHERE "memEmail" = $1`, [decoded.Email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // ตรวจสอบ cart และ items ว่ามีอยู่ในระบบ
    const resultCheckCart = await db.query(`SELECT * FROM carts WHERE "cart_id" = $1 AND "userId" = $2 AND "is_succ" != true`, [req.body.cart_id, userId]);

    if (resultCheckCart.rows.length === 0) {
      return res.status(400).json({ error: "Cart or items not found" });
    }

    // อัพเดตจำนวนสินค้าใน cart
    const queryUpdateQty = `UPDATE "cart_items" ci
                            SET "quantity" = $1
                            FROM "carts" ct
                            WHERE ci."cart_id" = ct."cart_id"
                              AND ci."cart_id" = $2
                              AND ci."product_id" = $3
                              AND ct."userId" = $4
                              AND ct."is_succ" != true;
                            `;
    const resultUpdateQty = await db.query(queryUpdateQty, [
      req.body.qty,
      req.body.cart_id,
      req.body.product_id,
      userId,
    ]);

    if (resultUpdateQty.rowCount === 0) {
      return res.status(400).json({ error: "Failed to update quantity" });
    }

    return res.json({ status: 200, message: "Quantity updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

export async function delCartItem(req, res) {
  console.log(`POST Delete Cart Item is Requested`);
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }

    const secret_key = process.env.SECRET_KEY;
    let decoded;
    try {
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    // ค้นหาข้อมูล user จาก decoded Email
    const userResult = await db.query(`SELECT * FROM members WHERE "memEmail" = $1`, [decoded.Email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // ตรวจสอบ cart และ items ว่ามีอยู่ในระบบ
    const queryCheckCart = `SELECT * FROM carts WHERE "cart_id" = $1 AND "userId" = $2 AND "is_succ" != true`;
    const resultCheckCart = await db.query(queryCheckCart, [
      req.body.cart_id,
      userId,
    ]);

    if (resultCheckCart.rows.length === 0) {
      return res.status(400).json({ error: "Cart or items not found" });
    }

    // ลบสินค้าจาก cart
    const queryDelItem = `DELETE FROM "cart_items" ci
                          USING "carts" ct
                          WHERE ci."cart_id" = ct."cart_id"
                            AND ci."cart_id" = $1
                            AND ci."product_id" = $2
                            AND ct."userId" = $3
                            AND ct."is_succ" != true;`;
    const resultDelItem = await db.query(queryDelItem, [
      req.body.cart_id,
      req.body.product_id,
      userId,
    ]);

    if (resultDelItem.rowCount === 0) {
      return res.status(400).json({ error: "Failed to delete item" });
    }

    return res.json({ status: 200, message: "Item deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}


export async function delCart(req, res) {
  console.log(`POST Delete Cart is Requested`);
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }

    const secret_key = process.env.SECRET_KEY;
    let decoded;
    try {
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    // ค้นหาข้อมูล user จาก decoded Email
    const userResult = await db.query(`SELECT * FROM members WHERE "memEmail" = $1`, [decoded.Email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // ตรวจสอบ cart ว่ามีอยู่ในระบบหรือไม่
    const queryCheckCart = `SELECT * FROM carts WHERE "cart_id" = $1 AND "userId" = $2 AND "is_succ" != true`;
    const resultCheckCart = await db.query(queryCheckCart, [
      req.body.cart_id,
      userId,
    ]);

    if (resultCheckCart.rows.length === 0) {
      return res.status(400).json({ error: "Cart or items not found" });
    }

    // ลบ cart
    const queryDelCart = `DELETE FROM carts WHERE "cart_id" = $1 AND "userId" = $2 AND "is_succ" != true`;
    const resultDelCart = await db.query(queryDelCart, [
      req.body.cart_id,
      userId,
    ]);

    if (resultDelCart.rowCount === 0) {
      return res.status(400).json({ error: "Failed to delete cart" });
    }

    return res.json({ status: 200, message: "Cart deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}


export async function confirmCart(req, res) {
  console.log(`POST Confirm Cart is Requested`);
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }

    const secret_key = process.env.SECRET_KEY;
    let decoded;
    try {
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    // ค้นหาข้อมูลผู้ใช้จาก decoded Email
    const userResult = await db.query(`SELECT * FROM members WHERE "memEmail" = $1`, [decoded.Email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // ตรวจสอบว่าตะกร้ามีอยู่และยังไม่สมบูรณ์
    const queryCheckCart = `SELECT * FROM carts WHERE "cart_id" = $1 AND "userId" = $2 AND "is_succ" != true`;
    const resultCheckCart = await db.query(queryCheckCart, [
      req.body.cart_id,
      userId,
    ]);

    if (resultCheckCart.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Cart not found or already confirmed" });
    }

    // ตรวจสอบว่าตะกร้ามีสินค้าหรือไม่
    const queryCheckCartItems = `SELECT * FROM cart_items WHERE "cart_id" = $1`;
    const resultCheckCartItems = await db.query(queryCheckCartItems, [
      req.body.cart_id,
    ]);

    if (resultCheckCartItems.rows.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // อัปเดทสถานะตะกร้าเป็น "สำเร็จ"
    const queryConfirmCart = `UPDATE carts SET "is_succ" = $1 WHERE "cart_id" = $2 AND "userId" = $3 AND "is_succ" != true`;
    const resultConfirmCart = await db.query(queryConfirmCart, [
      true,
      req.body.cart_id,
      userId,
    ]);

    if (resultConfirmCart.rowCount === 0) {
      return res.status(400).json({ error: "Failed to confirm cart" });
    }

    return res.json({
      status: 200,
      message: "Cart confirmed successfully",
      cart_id: req.body.cart_id,
    });
  } catch (error) {
    console.error("Error confirming cart:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}
