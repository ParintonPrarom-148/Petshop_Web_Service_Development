import db from "../Service/database.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from "multer";
export async function addMember(req, res) {
    console.log('POST /addMember Requested');
    const bodyData = req.body;
    try {
        
        if (req.body.Email == null || req.body.fName == null || req.body.lName == null|| req.body.password == null || req.body.Email == '' || req.body.fName == '' || req.body.lName == '' || req.body.password == '') {
            return res.status(422).json({
                error: 'Bad Request - Email, fName, lName and password are required'
            });
            
        }
        const userName = req.body.Email.split('@')[0];
        const pwd = req.body.password;
        const salt = 11;
        const pwdHash = await bcrypt.hash(pwd, salt);
        const queryCheck = 'SELECT EXISTS(SELECT * FROM public.members WHERE "memEmail" = $1)';
        const resultCheck = await db.query(queryCheck,[
            req.body.Email
        ]);
        if (resultCheck.rows[0].exists) {
            return res.json({
                message: `Conflict - memEmail ${req.body.Email} already exists`,
                regist:false,
            });
        }
        
        // NOTE: insert data to the database using parameterize, WARNING: concatenate string is not safe
        const query = 'INSERT INTO public.members( "memEmail", "userName","memfName", "memlName",  "memHash","roleId") VALUES($1,$2,$3,$4,$5,$6) ';
        const result = await db.query(query,[
            req.body.Email,
            userName,
            req.body.fName, 
            req.body.lName, 
            pwdHash, 
            req.body.roldId ?? 1, 

        ]);
        

        return res.status(201).json({regist:true});
    } catch (error) {
        res.json({
            message: error,
            regist:false,

        });
    }  
};


export async function loginMember(req, res) {
    console.log('POST /loginMember Requested');
    const bodyData = req.body;
    try {
        
        if ( req.body.email == null || req.body.password == null || req.body.password == '' || req.body.email == ''){
            // return res.status(422).json({
            //     error: 'Bad Request - memEmail and loginname are required'
            // });
            return res.json({
                login:false});
        }
        
        const queryCheck = 'SELECT EXISTS(SELECT * FROM member_role_view WHERE "memEmail" = $1)';
        const resultCheck = await db.query(queryCheck,[
            req.body.email
        ]);
        if (!resultCheck.rows[0].exists) {
            return res.json({
                message:"อีเมลหรือรหัสผ่านไม่ถูกต้อง",
                login:false});
        }
        const query = 'SELECT * FROM member_role_view WHERE "memEmail" = $1';
        const result = await db.query(query,
        [
            req.body.email
        ]);
        
        const loginok = await bcrypt.compare(req.body.password, result.rows[0].memHash);
        

        if(loginok){
        const theuser = {
            userId: result.rows[0].userId,
            Email: result.rows[0].memEmail,
            fName: result.rows[0].memfName,
            lName: result.rows[0].memlName,
            password: result.rows[0].memHash,
            roleId: result.rows[0].roleId,
            roleTH: result.rows[0].roleTHName,
            roleEN: result.rows[0].roleENName,
        };   
        const secret_key = process.env.SECRET_KEY;
        const token = jwt.sign(theuser, secret_key);
 
        res.cookie('token', token, {
            // ms * sec * min * hour * day
            maxAge: 1000 * 60 * 60, // 1 hour
            secure:true,
            sameSite: 'None',
        });
        return res.json({
            login:true,
            token: token});
        }
        else{
            res.clearCookie('token', {
                secure:true,
                sameSite: 'None',
            });
            return res.json({
                login:false});
        }
    } catch (error) {
        // res.status(500).json({
        //     error: error.message
        // });
        return res.json({
            message:"อีเมลหรือรหัสผ่านไม่ถูกต้อง",
            login:false})
        }
      
};

export async function logoutMember(req, res) {
        console.log('POST /logoutMember Requested');   
    try {
            res.clearCookie('token', {
                secure:true,
                sameSite: 'None',
            });
            
        return res.json({
            login:false});
    } catch (error) {
        // res.status(500).json({
        //     error: error.message
        // });
        return res.json({
            error:error})
        }
      
};
export async function updateUser(req, res) {
    console.log('POST /updateUser Requested');
    const bodyData = req.body;
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized - No token provided'
            });
        }

        const secret_key = process.env.SECRET_KEY;
        let decoded;
        try {
            decoded = jwt.verify(token, secret_key);
        } catch (err) {
            return res.status(401).json({
                message: 'Unauthorized - Invalid token'
            });
        }
        
        // ตรวจสอบว่า email, fName, lName ได้รับการส่งมาหรือไม่
        if (req.body.email == null || req.body.fName == null || req.body.lName == null || req.body.email == '' || req.body.fName == '' || req.body.lName == '') {
            return res.status(422).json({
                message: 'Bad Request - Email, Name and Surname are required'
            });
        }

        // ตรวจสอบว่า memEmail ของ decoded ตรงกับข้อมูลใน member_role_view หรือไม่
        let queryCheck = 'SELECT * FROM public.member_role_view WHERE "memEmail" = $1';
        let resultCheck = await db.query(queryCheck, [decoded.Email]);
        if (resultCheck.rows.length === 0) {
            return res.status(409).json({
                message: 'Conflict - User not exists',
            });
        }

        // ตรวจสอบว่า email ที่ส่งมาไม่ซ้ำกับอีเมลที่มีในฐานข้อมูล
        queryCheck = 'SELECT EXISTS(SELECT * FROM public.members WHERE "memEmail" = $1)';
        resultCheck = await db.query(queryCheck, [req.body.email]);
        if (resultCheck.rows[0].exists && req.body.email !== decoded.Email) {
            return res.status(409).json({
                message: `Conflict - Email ${req.body.email} already exists`,
            });
        }

        // ทำการอัปเดตข้อมูล
        const query = 'UPDATE public.members SET "memfName" = $1, "memlName" = $2 WHERE "memEmail" = $3';
        await db.query(query, [
            req.body.fName,
            req.body.lName,
            req.body.email
        ]);

        // ดึงข้อมูลสมาชิกที่อัปเดตแล้ว
        const getDataQuery = 'SELECT * FROM member_role_view WHERE "memEmail" = $1';
        const getDataResult = await db.query(getDataQuery, [
            req.body.email
        ]);

        const theuser = {
 
            Email: getDataResult.rows[0].memEmail,
            fName: getDataResult.rows[0].memfName,
            lName: getDataResult.rows[0].memlName,
            password: getDataResult.rows[0].memHash,
            roleId: getDataResult.rows[0].roleId,
            roleTH: getDataResult.rows[0].roleTHName,
            roleEN: getDataResult.rows[0].roleENName,
        };

        // สร้าง Token ใหม่หลังจากการอัปเดต
        const newToken = jwt.sign(theuser, secret_key);

        res.cookie('token', newToken, {
            maxAge: 1000 * 60 * 60, // 1 hour
            secure: true,
            sameSite: 'None',
        });

        return res.status(200).json({
            status: 200,
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message
        });
    }
}


export async function updatePassword(req, res) {
    console.log('POST /updatePassword Requested');
    const bodyData = req.body;
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        console.log(bodyData);
        console.log(token);
        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized - No token provided'
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
                error: 'Unauthorized - Invalid token'
            });
        }
        if ( req.body.password == null || req.body.password == ''){
            return res.status(422).json({
                error: 'Bad Request - password are required'
            });
        }
        const queryCheck = 'SELECT EXISTS(SELECT * FROM public.members WHERE "memEmail" = $1)';
        console.log(queryCheck  );
        const resultCheck = await db.query(queryCheck,[
            decoded.Email
        ]);
        console.log(resultCheck);
        if (!resultCheck.rows[0].exists) {
            return res.json({
                message: `Conflict - memEmail ${decoded.Email} not exists`,

            });
        }
        const pwd = req.body.password;
        const salt = 11;
        const pwdHash = await bcrypt.hash(pwd, salt);
        console.log(pwdHash);
        const query = 'UPDATE public.members SET "memHash" = $1 WHERE "memEmail" = $2';
        const result = await db.query(query,[
            pwdHash, 
            decoded.Email
        ]);
        console.log(result);
        return res.status(200).json({
            status: 200,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.json({

            message: error,

        });
    }  
}

export async function uploadMember(req, res) {
    console.log("Upload Member Image")
     upload(req, res, (err) => {
         if (err) {
             return res.status(400).json({ message: err.message });
         }
         res.status(200).json({ message: 'File uploaded successfully!' });
     });
 }
 