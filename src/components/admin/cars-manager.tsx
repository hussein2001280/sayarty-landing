"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { formatCurrency } from "@/lib/utils";

type CarRecord = {
  id: string;
  brand: string;
  name: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  price_label: string;
  description: string;
  main_image_id: string | null;
  featured: number;
  active: number;
  sort_order: number;
  specs: { label: string }[];
  colors: { name: string; hex_code: string }[];
};

type MediaOption = {
  id: string;
  file_name: string;
  alt_text: string;
  data_uri: string;
};

type FormState = {
  id?: string;
  brand: string;
  name: string;
  model: string;
  year: string;
  price: string;
  currency: string;
  priceLabel: string;
  description: string;
  mainImageId: string;
  featured: boolean;
  active: boolean;
  sortOrder: string;
  specs: string;
  colors: string;
};

const emptyForm: FormState = {
  brand: "",
  name: "",
  model: "",
  year: "2024",
  price: "",
  currency: "AED",
  priceLabel: "Starting from",
  description: "",
  mainImageId: "",
  featured: true,
  active: true,
  sortOrder: "1",
  specs: "",
  colors: "Black|#121212\nPearl White|#F2F2EE",
};

export function CarsManager({
  initialCars,
  mediaOptions,
}: {
  initialCars: CarRecord[];
  mediaOptions: MediaOption[];
}) {
  const [cars, setCars] = useState(initialCars);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const mediaMap = useMemo(
    () => new Map(mediaOptions.map((item) => [item.id, item])),
    [mediaOptions],
  );

  function loadCar(car: CarRecord) {
    setForm({
      id: car.id,
      brand: car.brand,
      name: car.name,
      model: car.model,
      year: String(car.year),
      price: String(car.price),
      currency: car.currency,
      priceLabel: car.price_label,
      description: car.description,
      mainImageId: car.main_image_id ?? "",
      featured: Boolean(car.featured),
      active: Boolean(car.active),
      sortOrder: String(car.sort_order),
      specs: car.specs.map((spec) => spec.label).join("\n"),
      colors: car.colors.map((color) => `${color.name}|${color.hex_code}`).join("\n"),
    });
  }

  async function refreshCars() {
    window.location.reload();
  }

  async function uploadCarImage(file: File) {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "car");
      formData.append("alt", `${form.brand} ${form.name}`.trim());

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to upload image.");
      }

      setForm((current) => ({ ...current, mainImageId: result.id }));
      toast.success("Image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      brand: form.brand,
      name: form.name,
      model: form.model,
      year: Number(form.year),
      price: Number(form.price),
      currency: form.currency,
      priceLabel: form.priceLabel,
      description: form.description,
      mainImageId: form.mainImageId || null,
      featured: form.featured,
      active: form.active,
      sortOrder: Number(form.sortOrder),
      specs: form.specs
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      colors: form.colors
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [name, hex] = line.split("|");
          return { name: name?.trim() ?? "Color", hex_code: hex?.trim() ?? "#C9A07F" };
        }),
    };

    const url = form.id ? `/api/admin/cars/${form.id}` : "/api/admin/cars";
    const method = form.id ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save car.");
      }

      toast.success(form.id ? "Car updated." : "Car created.");
      setForm(emptyForm);
      await refreshCars();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save car.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Unable to delete car.");
      }
      toast.success("Car deleted.");
      setCars((current) => current.filter((car) => car.id !== id));
      if (form.id === id) {
        setForm(emptyForm);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete car.");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        {cars.map((car) => {
          const label = `${car.brand} ${car.name} ${car.year}`;
          const image = car.main_image_id ? mediaMap.get(car.main_image_id) : null;

          return (
            <div key={car.id} className="rounded-[28px] border border-white/10 bg-[#111416] p-5">
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0D1012]">
                  {image ? (
                    <Image
                      src={image.data_uri}
                      alt={label}
                      width={720}
                      height={420}
                      unoptimized
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-[#A8AAA8]">No image</div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{label}</h2>
                      <p className="text-sm text-[#A8AAA8]">{car.model}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#E4C2A2]">
                        {car.price_label} {formatCurrency(car.currency, car.price)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-[#A8AAA8]">{car.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {car.colors.map((color) => (
                      <span
                        key={`${car.id}-${color.name}`}
                        className="h-5 w-5 rounded-full border border-white/10"
                        style={{ backgroundColor: color.hex_code }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => loadCar(car)}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(car.id)}
                      className="rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form className="rounded-[28px] border border-white/10 bg-[#111416] p-6" onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold text-white">{form.id ? "Edit Car" : "Create Car"}</h2>
        <div className="mt-5 grid gap-4">
          <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Brand" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} />
          <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Model" value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Year" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} />
            <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Currency" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} />
            <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Price label" value={form.priceLabel} onChange={(event) => setForm({ ...form, priceLabel: event.target.value })} />
          </div>
          <textarea className="rounded-2xl border border-white/10 px-4 py-3" rows={3} placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <select className="h-11 rounded-2xl border border-white/10 px-4" value={form.mainImageId} onChange={(event) => setForm({ ...form, mainImageId: event.target.value })}>
            <option value="">Select main image</option>
            {mediaOptions.map((media) => (
              <option key={media.id} value={media.id}>
                {media.file_name}
              </option>
            ))}
          </select>
          <label className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-[#A8AAA8]">
            {uploading ? "Uploading..." : "Upload car image"}
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.avif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadCarImage(file);
                }
              }}
            />
          </label>
          <textarea className="rounded-2xl border border-white/10 px-4 py-3" rows={4} placeholder="One spec per line" value={form.specs} onChange={(event) => setForm({ ...form, specs: event.target.value })} />
          <textarea className="rounded-2xl border border-white/10 px-4 py-3" rows={4} placeholder="One color per line: Name|#HEX" value={form.colors} onChange={(event) => setForm({ ...form, colors: event.target.value })} />
          <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Sort order" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
            Featured
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
            Active
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="h-11 flex-1 rounded-full bg-[#C9A07F] font-medium text-[#080A0B]">
              {saving ? "Saving..." : form.id ? "Update Car" : "Create Car"}
            </button>
            {form.id ? (
              <button type="button" onClick={() => setForm(emptyForm)} className="h-11 rounded-full border border-white/10 px-5">
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}
