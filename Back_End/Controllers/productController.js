import db from "../Service/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function getProduct(req, res) {
  console.log("GET /getProduct Requested");
  try {
    let query = `SELECT p.*, pt.product_type_name FROM products p
                    LEFT JOIN product_types pt ON p."product_type_id" = pt."product_type_id"`;
    const conditions = [];
    const params = [];

    console.log("Request Body:", req.body);

    if (req.body.product_name && req.body.product_name.trim() !== "") {
      conditions.push(`p."product_name" ILIKE $${params.length + 1}`);
      params.push(`%${req.body.product_name}%`);
    }

    if (req.body.product_type_id && req.body.product_type_id.trim() !== "") {
      conditions.push(`p."product_type_id" = $${params.length + 1}`);
      params.push(req.body.product_type_id);  // Removed `%` here
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    console.log("Final Query:", query);
    console.log("Query Parameters:", params);

    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
}

export async function addProduct(req, res) {
  console.log("POST /addProduct Requested");

  // ดึงข้อมูลจาก body request
  const { product_name, product_type_id, product_price, product_image, product_detail } = req.body;

  try {
    // ตรวจสอบ Header และเช็คว่ามี "Bearer" ด้านหน้า Token หรือไม่
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized - No token provided or wrong format" });
    }

    // ดึง Token ออกจาก "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - ไม่มี Token ในคำขอ" });
    }

    // ตรวจสอบและถอดรหัส Token ด้วย SECRET_KEY
    const secret_key = process.env.SECRET_KEY;
    let decoded;
    try {
      decoded = jwt.verify(token, secret_key); // ถอดรหัส JWT เพื่อดึงข้อมูลผู้ใช้
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized - Token ไม่ถูกต้อง" });
    }

    // ตรวจสอบว่าข้อมูลสินค้าใน Body ครบหรือไม่
    if (!product_name || !product_type_id || !product_price || !product_image || !product_detail) {
      return res.status(422).json({ error: "ข้อมูลไม่ครบ - กรุณากรอกข้อมูลทุกช่อง" });
    }

    // เตรียมข้อมูลสำหรับบันทึกใน Database
    const datetime = new Date();
    const query = `INSERT INTO public.products(
      "product_id", "product_name", "product_detail", "product_image", 
      "product_type_id", "product_price", "create_date", "create_by"
    ) VALUES (nextval('products_id_seq'), $1, $2, $3, $4, $5, $6, $7)`;

    try {
      await db.query(query, [
        product_name, product_detail, product_image, product_type_id, product_price, datetime, decoded.userId,
      ]);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", details: dbError.message });
    }

    console.log("เพิ่มสินค้าเรียบร้อย:", { product_name, product_type_id, datetime, userId: decoded.userId });
    return res.status(200).json({ status: 200, message: "เพิ่มสินค้าสำเร็จ" });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดที่ไม่คาดคิด", details: error.message });
  }
}
export async function updateProduct(req, res) {
  console.log(`PUT /updateProduct Requested`);
  const bodyData = req.body;
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    console.log(bodyData);
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

    // NOTE: insert data to the database using parameterize, WARNING: concatenate string is not safe
    const query = `UPDATE public.products 
                        SET "product_name" = $1, "product_price" = $2,"product_detail"=$3 ,"product_type_id" = $4,"product_image" = $5 , "update_by" = $6 ,"update_date" =$7 WHERE "product_id" = $8`;
    const result = await db.query(query, [
      req.body.product_name,
      req.body.product_price,
      req.body.product_detail,
      req.body.product_type_id,
      req.body.product_image,
      decoded.userId,
      new Date(),
      req.body.product_id,
    ]);

    if (result.rowCount == 0) {
      return res.status(404).json({
        error: `Not Found - product_id ${req.body.product_id} not found`,
      });
    }

    console.log(bodyData);
    return res.status(201).json({ status: 200, bodyData });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}

export async function delProduct(req, res) {
  console.log(`DELETE /delProduct ${req.body.product_id} Requested`);

  try {
    // NOTE: insert data to the database using parameterize, WARNING: concatenate string is not safe
    const query = `DELETE FROM products  WHERE "product_id" = $1`;
    const result = await db.query(query, [req.body.product_id]);

    if (result.rowCount == 0) {
      return res.status(404).json({
        error: `Not Found - pdId ${req.body.product_id} not found`,
      });
    }

    return res
      .status(200)
      .json({ status: 200, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}
