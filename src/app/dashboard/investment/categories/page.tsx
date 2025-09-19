"use client";

import { TableCaption, TableHeader, TableRow, TableHead, TableBody, TableFooter, Table } from "@/components/ui/table";
import { fetchCategories } from "@/lib/fetcher/api";
import { useEffect, useState } from "react";

export default function CategoriesPage() {

    const [categories, setCategories] = useState<{ id: number; name: string; description: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetchCategories();
            setCategories(res || []);

        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Investment Categories</h1>
            <Table className="border border-gray-300 p-4">
                <TableCaption></TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableHead className="font-medium">{category.id}</TableHead>
                            <TableHead>{category.name}</TableHead>
                            <TableHead>{category.description}</TableHead>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>

                </TableFooter>
            </Table>
        </div>
    )
}