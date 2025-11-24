import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const LEVELS = [
    { level: 1, label: "Level 1", goal: 1_000_000 },
    { level: 2, label: "Level 2", goal: 5_000_000 },
    { level: 3, label: "Level 3", goal: 10_000_000 },
    { level: 4, label: "Level 4", goal: 50_000_000 },
    { level: 5, label: "Level 5", goal: 100_000_000 },
    { level: 6, label: "Level 6", goal: 500_000_000 },
    { level: 7, label: "Level 7", goal: 1_000_000_000 },
    { level: 8, label: "Level 8", goal: 5_000_000_000 },
    { level: 9, label: "Level 9", goal: 10_000_000_000 },
    { level: 10, label: "Level 10", goal: 25_000_000_000 },
    { level: 11, label: "Level 11", goal: 50_000_000_000 },
    { level: 12, label: "Level 12", goal: 75_000_000_000 },
    { level: 13, label: "Level 13", goal: 100_000_000_000 },
];

export async function GET() {
    try {
        const { rows } = await pool.query(
            "SELECT COALESCE(total, 0)::float AS total FROM investments ORDER BY created_at DESC NULLS LAST, id DESC LIMIT 1"
        );
        const currentValue = Number(rows?.[0]?.total ?? 0);

        return NextResponse.json(
            {
                data: {
                    currentValue,
                    levels: LEVELS,
                },
            },
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    } catch (err) {
        console.error("investment performance levels error:", err);
        return NextResponse.json(
            { error: "failed_to_fetch_performance_levels" },
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
