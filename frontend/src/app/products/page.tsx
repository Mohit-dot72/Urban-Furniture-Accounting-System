"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1),
  category: z.string().min(1, "Category is required"),
  salesPrice: z.coerce.number().min(0),
  purchasePrice: z.coerce.number().min(0),
});

type ProductForm = z.infer<typeof productSchema>;

const mockProducts = [
  { id: "1", name: "Office Chair", type: "Goods", category: "Chair", salesPrice: 17000, purchasePrice: 4329.05, status: "Active" },
  { id: "2", name: "Workstation", type: "Goods", category: "Table", salesPrice: 280000, purchasePrice: 12500, status: "Active" },
  { id: "3", name: "Sofa", type: "Goods", category: "Sofa", salesPrice: 35000, purchasePrice: 22800, status: "Active" },
  { id: "4", name: "Dining Table", type: "Goods", category: "Table", salesPrice: 28000, purchasePrice: 16300, status: "Active" },
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [products, setProducts] = useState(mockProducts);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { type: "Goods" },
  });

  const openAdd = () => { setEditing(null); reset({ type: "Goods" }); setOpen(true); };
  const openEdit = (p: any) => { setEditing(p); reset(p); setOpen(true); };
  const onSubmit = (data: ProductForm) => {
    if (editing) {
      setProducts((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...data } : p));
    } else {
      setProducts((prev) => [...prev, { id: String(Date.now()), ...data, status: "Active" } as any]);
    }
    setOpen(false);
  };
  const deleteProduct = (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id));
  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Button size="sm" onClick={openAdd} className="gap-1.5">
          <Plus size={15} /> New Product
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
          <Input placeholder="Search products..." className="pl-8 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Filter size={13} /> Filter
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/80 hover:bg-muted/80">
              <TableHead className="text-xs font-semibold text-muted-foreground">Name</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Category</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Sales Price</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Purchase Price</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/50">
                <TableCell className="font-medium text-sm py-3">{p.name}</TableCell>
                <TableCell className="text-xs">{p.category}</TableCell>
                <TableCell className="text-xs">
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">{p.type}</span>
                </TableCell>
                <TableCell className="text-xs text-right font-medium">{fmt(p.salesPrice)}</TableCell>
                <TableCell className="text-xs text-right font-medium">{fmt(p.purchasePrice)}</TableCell>
                <TableCell>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-muted/50 text-muted-foreground"}`}>{p.status}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil size={13} className="text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteProduct(p.id)}><Trash2 size={13} className="text-red-400" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t px-5 py-2.5 text-xs text-muted-foreground">Showing 1 to {filtered.length} of {filtered.length} entries</div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Name *</label>
                <Input {...register("name")} placeholder="Product name" className="h-9 text-sm" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                <Select defaultValue="Goods" onValueChange={(v) => setValue("type", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Goods">Goods</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category *</label>
                <Input {...register("category")} placeholder="Category" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sales Price</label>
                <Input {...register("salesPrice")} type="number" placeholder="0.00" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Purchase Price</label>
                <Input {...register("purchasePrice")} type="number" placeholder="0.00" className="h-9 text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">{editing ? "Update" : "Save Product"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
