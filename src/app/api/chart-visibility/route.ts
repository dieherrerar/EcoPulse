import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "chart_visibility.json");

const DEFAULT_VIS = {
  BarChartComp: true,
  LineChartComp: true,
  PieChartComp: true,
  AreaChartComp: true,
};

type Visibility = typeof DEFAULT_VIS;

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.writeFile(
      FILE_PATH,
      JSON.stringify(DEFAULT_VIS, null, 2),
      "utf-8"
    );
  }
}

async function readVisibility(): Promise<Visibility> {
  await ensureFile();
  const raw = await fs.readFile(FILE_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  return { ...DEFAULT_VIS, ...parsed };
}

function isValidVisibility(body: any): body is Visibility {
  if (!body || typeof body !== "object") return false;
  const keys = Object.keys(DEFAULT_VIS) as (keyof Visibility)[];
  return keys.every((k) => typeof body[k] === "boolean");
}

export async function GET() {
  try {
    const data = await readVisibility();
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? "Error leyendo visibilidad" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!isValidVisibility(body)) {
      return NextResponse.json(
        { success: false, error: "Formato inválido de visibilidad" },
        { status: 400 }
      );
    }

    await ensureFile();
    await fs.writeFile(FILE_PATH, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? "Error guardando visibilidad" },
      { status: 500 }
    );
  }
}
