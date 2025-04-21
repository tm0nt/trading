import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import pool from "@/lib/db";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// GET  /api/config/update
export async function GET() {
  try {
    const result = await pool.query(`SELECT * FROM "Config" WHERE id = 1`);
    if (result.rowCount === 0) {
      const insert = await pool.query(
        `INSERT INTO "Config" (id, "nomeSite", "logoUrl", "valorMinimoSaque", "valorMinimoDeposito")
         VALUES (1, 'Minha Plataforma', '', 100.00, 50.00)
         RETURNING *`,
      );
      return NextResponse.json({ success: true, data: insert.rows[0] });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Erro ao buscar config:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar config" },
      { status: 500 },
    );
  }
}

// POST /api/config/update
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Colunas permitidas para atualização via JSON
    const allowedFields = [
      "nomeSite",
      "logoUrl",
      "valorMinimoSaque",
      "valorMinimoDeposito",
      "endPointGateway",
      "tokenPublicoGateway",
      "tokenPrivadoGateway",
    ];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      for (const field of allowedFields) {
        const value = form.get(field);
        if (value) {
          if (field === "valorMinimoSaque" || field === "valorMinimoDeposito") {
            updates.push(`"${field}" = $${paramIndex++}`);
            values.push(parseFloat((value as string).replace(",", ".")));
          } else {
            updates.push(`"${field}" = $${paramIndex++}`);
            values.push(value);
          }
        }
      }

      const logoFile = form.get("logo") as Blob;
      if (logoFile && logoFile.size > 0) {
        const originalName = (logoFile as any).name || `logo`;
        const filename = `${Date.now()}_${originalName.replace(/\s+/g, "_")}`;
        const arrayBuffer = await logoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filePath = path.join(UPLOAD_DIR, filename);
        fs.writeFileSync(filePath, buffer);

        const logoUrl = `/uploads/${filename}`;
        updates.push(`"logoUrl" = $${paramIndex++}`);
        values.push(logoUrl);
      }
    } else {
      const json = await req.json();

      for (const [key, value] of Object.entries(json)) {
        if (allowedFields.includes(key)) {
          if (key === "valorMinimoSaque" || key === "valorMinimoDeposito") {
            updates.push(`"${key}" = $${paramIndex++}`);
            values.push(parseFloat((value as string).replace(",", ".")));
          } else {
            updates.push(`"${key}" = $${paramIndex++}`);
            values.push(value);
          }
        }
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum campo enviado para atualizar." },
        { status: 400 },
      );
    }

    const query = `
      UPDATE "Config"
      SET ${updates.join(", ")}
      WHERE id = 1
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Erro ao processar config:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar config" },
      { status: 500 },
    );
  }
}
