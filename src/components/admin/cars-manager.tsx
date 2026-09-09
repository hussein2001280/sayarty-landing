"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { carDisplayName } from "@/lib/business";
import { formatPrice } from "@/lib/utils";

type ColorRecord = {
  id?: string;
  name: string;
  hex_code: string;
  image_id: string | null;
  active: number | boolean;
  sort_order: number;
};

type CarRecord = {
  id: string;
  brand: string;
  name: string;
  model: string;
  display_name: string;
  year: number;
  price: number;
  currency: string;
  price_label: string;
  body_type: string;
  transmission: string;
  description: string;
  main_image_id: string | null;
  featured: number;
  active: number;
  sort_order: number;
  specs: { label: string }[];
  colors: ColorRecord[];
};

type MediaOption = {
  id: string;
  file_name: string;
  alt_text: string;
  data_uri: string;
};

type ColorDraft = {
  name: string;
  hex_code: string;
  image_id: string | null;
  preview: string;
  active: boolean;
  sort_order: number;
};

type FormState = {
  id?: string;
  brand: string;
  name: string;
  model: string;
  displayName: string;
  year: string;
  price: string;
  currency: string;
  priceLabel: string;
  bodyType: string;
  transmission: string;
  description: string;
  mainImageId: string;
  mainImagePreview: string;
  featured: boolean;
  active: boolean;
  sortOrder: string;
  specs: string;
  colors: ColorDraft[];
};

const emptyColor = (): ColorDraft => ({
  name: "",
  hex_code: "#C9A07F",
  image_id: null,
  preview: "",
  active: true,
  sort_order: 1,
});

const emptyForm: FormState = {
  brand: "",
  name: "",
  model: "",
  displayName: "",
  year: "2026",
  price: "",
  currency: "AED",
  priceLabel: "Starting from",
  bodyType: "",
  transmission: "Automatic",
  description: "",
  mainImageId: "",
  mainImagePreview: "",
  featured: true,
  active: true,
  sortOrder: "1",
  specs: "",
  colors: [
    { name: "Black", hex_code: "#121212", image_id: null, preview: "", active: true, sort_order: 1 },
    { name: "Pearl White", hex_code: "#F2F2EE", image_id: null, preview: "", active: true, sort_order: 2 },
    { name: "Champagne", hex_code: "#C9A07F", image_id: null, preview: "", active: true, sort_order: 3 },
  ],
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
  const [colorUploadingIndex, setColorUploadingIndex] = useState<number | null>(null);

  const mediaMap = useMemo(
    () => new Map(mediaOptions.map((item) => [item.id, item])),
    [mediaOptions],
  );

  function loadCar(car: CarRecord) {
    const image = car.main_image_id ? mediaMap.get(car.main_image_id) : null;

    setForm({
      id: car.id,
      brand: car.brand,
      name: car.name,
      model: car.model,
      displayName: car.display_name || carDisplayName(car),
      year: String(car.year),
      price: String(car.price),
      currency: car.currency,
      priceLabel: car.price_label,
      bodyType: car.body_type,
      transmission: car.transmission,
      description: car.description,
      mainImageId: car.main_image_id ?? "",
      mainImagePreview: image?.data_uri ?? "",
      featured: Boolean(car.featured),
      active: Boolean(car.active),
      sortOrder: String(car.sort_order),
      specs: car.specs.map((spec) => spec.label).join("\n"),
      colors: car.colors.length
        ? car.colors.map((color, index) => ({
            name: color.name,
            hex_code: color.hex_code,
            image_id: color.image_id,
            preview: color.image_id ? mediaMap.get(color.image_id)?.data_uri ?? "" : "",
            active: Boolean(color.active),
            sort_order: color.sort_order || index + 1,
          }))
        : [emptyColor()],
    });
  }

  async function refreshCars() {
    window.location.reload();
  }

  async function uploadImage(file: File, kind: "car" | "gallery", alt: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    formData.append("alt", alt);

    const response = await fetch("/api/media", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? "Unable to upload image.");
    }

    return result as { id: string; data_uri: string };
  }

  async function uploadCarImage(file: File) {
    setUploading(true);

    try {
      const result = await uploadImage(file, "car", `${form.brand} ${form.name}`.trim() || file.name);
      setForm((current) => ({
        ...current,
        mainImageId: result.id,
        mainImagePreview: result.data_uri,
      }));
      toast.success("Car image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function uploadColorImage(index: number, file: File) {
    setColorUploadingIndex(index);

    try {
      const color = form.colors[index];
      const result = await uploadImage(file, "gallery", color?.name || "Car color");
      setForm((current) => ({
        ...current,
        colors: current.colors.map((item, itemIndex) =>
          itemIndex === index
            ? { ...item, image_id: result.id, preview: result.data_uri }
            : item,
        ),
      }));
      toast.success("Color image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload color image.");
    } finally {
      setColorUploadingIndex(null);
    }
  }

  function payloadFromForm(current: FormState = form) {
    return {
      brand: current.brand,
      name: current.name,
      model: current.model,
      displayName: current.displayName || `${current.brand} ${current.name} ${current.year}`.trim(),
      year: Number(current.year),
      price: Number(current.price),
      currency: current.currency,
      priceLabel: current.priceLabel,
      bodyType: current.bodyType,
      transmission: current.transmission,
      description: current.description,
      mainImageId: current.mainImageId || null,
      featured: current.featured,
      active: current.active,
      sortOrder: Number(current.sortOrder),
      specs: current.specs
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      colors: current.colors
        .filter((color) => color.name.trim())
        .map((color, index) => ({
          name: color.name.trim(),
          hex_code: color.hex_code.trim() || "#C9A07F",
          image_id: color.image_id,
          active: color.active,
          sort_order: color.sort_order || index + 1,
        })),
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const url = form.id ? `/api/admin/cars/${form.id}` : "/api/admin/cars";
    const method = form.id ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm()),
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

  async function patchCar(id: string, body: Record<string, unknown>) {
    const response = await fetch(`/api/admin/cars/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error ?? "Unable to update car.");
    }
  }

  async function toggleFlag(car: CarRecord, field: "featured" | "active") {
    const nextValue = !car[field];
    try {
      await patchCar(car.id, { [field]: nextValue });
      setCars((current) =>
        current.map((item) => (item.id === car.id ? { ...item, [field]: nextValue ? 1 : 0 } : item)),
      );
      toast.success(field === "featured" ? (nextValue ? "Featured." : "Unfeatured.") : nextValue ? "Published." : "Unpublished.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update car.");
    }
  }

  async function moveCar(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= cars.length) {
      return;
    }

    const current = cars[index];
    const neighbor = cars[targetIndex];

    try {
      await Promise.all([
        patchCar(current.id, { sortOrder: neighbor.sort_order }),
        patchCar(neighbor.id, { sortOrder: current.sort_order }),
      ]);
      setCars((items) => {
        const next = [...items];
        next[index] = { ...neighbor, sort_order: current.sort_order };
        next[targetIndex] = { ...current, sort_order: neighbor.sort_order };
        return next;
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reorder cars.");
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

  const imagePreview = form.mainImagePreview || (form.mainImageId ? mediaMap.get(form.mainImageId)?.data_uri : "");

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setForm({ ...emptyForm, sortOrder: String(cars.length + 1) })}
          className="h-11 rounded-full bg-[#C9A07F] px-5 text-sm font-medium text-[#080A0B]"
        >
          Add New Car
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {cars.map((car, index) => {
            const label = car.display_name || carDisplayName(car);
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
                      <div className="flex h-40 flex-col items-center justify-center gap-1 px-3 text-center text-sm text-[#A8AAA8]">
                        <span>No image uploaded</span>
                        <span className="text-xs">Upload Car Image</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-semibold text-white">{label}</h2>
                        <p className="text-sm text-[#A8AAA8]">
                          {car.brand} · {car.model} · {car.year}
                        </p>
                        <p className="mt-1 text-xs text-[#A8AAA8]">
                          {car.active ? "Published" : "Unpublished"} · {car.featured ? "Featured" : "Not featured"} · Order {car.sort_order}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#E4C2A2]">
                          {formatPrice(car.price, { currencyCode: car.currency })}
                        </p>
                        <p className="text-xs text-[#A8AAA8]">{car.price_label}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#A8AAA8]">{car.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {car.colors.map((color) => (
                        <span
                          key={`${car.id}-${color.name}-${color.hex_code}`}
                          className="h-5 w-5 rounded-full border border-white/10"
                          style={{ backgroundColor: color.hex_code, opacity: color.active ? 1 : 0.35 }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => loadCar(car)}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleFlag(car, "active")}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm"
                      >
                        {car.active ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleFlag(car, "featured")}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm"
                      >
                        {car.featured ? "Unfeature" : "Feature"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveCar(index, -1)}
                        disabled={index === 0}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
                      >
                        Move up
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveCar(index, 1)}
                        disabled={index === cars.length - 1}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
                      >
                        Move down
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
          <h2 className="text-xl font-semibold text-white">{form.id ? "Edit Car" : "Add New Car"}</h2>
          <p className="mt-2 text-sm text-[#A8AAA8]">
            Featured and published cars appear in This Month&apos;s Offers. Leave the image empty until you upload it.
          </p>
          <div className="mt-5 grid gap-4">
            <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Brand" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} />
            <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Model" value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} />
            <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Display name" value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} />
            <div className="grid gap-4 md:grid-cols-2">
              <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Year" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} />
              <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Currency" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} />
              <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Price label" value={form.priceLabel} onChange={(event) => setForm({ ...form, priceLabel: event.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Body type" value={form.bodyType} onChange={(event) => setForm({ ...form, bodyType: event.target.value })} />
              <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Transmission" value={form.transmission} onChange={(event) => setForm({ ...form, transmission: event.target.value })} />
            </div>
            <textarea className="rounded-2xl border border-white/10 px-4 py-3" rows={3} placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />

            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-sm font-medium text-white">Vehicle Image</p>
              <div className="mt-3 overflow-hidden rounded-2xl border border-dashed border-white/10 bg-[#0D1012]">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt={form.displayName || "Car image preview"}
                    width={800}
                    height={480}
                    unoptimized
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 flex-col items-center justify-center gap-1 text-sm text-[#A8AAA8]">
                    <span>No image uploaded</span>
                    <span>Upload Car Image</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="rounded-full border border-white/10 px-4 py-2 text-sm">
                  {uploading ? "Uploading..." : imagePreview ? "Replace" : "Upload Car Image"}
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.avif,image/png,image/jpeg,image/webp,image/avif"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) {
                        void uploadCarImage(file);
                      }
                    }}
                  />
                </label>
                {form.mainImageId ? (
                  <button
                    type="button"
                    className="rounded-full border border-white/10 px-4 py-2 text-sm"
                    onClick={() => setForm({ ...form, mainImageId: "", mainImagePreview: "" })}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>

            <textarea className="rounded-2xl border border-white/10 px-4 py-3" rows={4} placeholder="One specification per line" value={form.specs} onChange={(event) => setForm({ ...form, specs: event.target.value })} />

            <div className="rounded-2xl border border-white/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">Colors</p>
                <button
                  type="button"
                  className="rounded-full border border-white/10 px-3 py-1 text-xs"
                  onClick={() =>
                    setForm({
                      ...form,
                      colors: [...form.colors, { ...emptyColor(), sort_order: form.colors.length + 1 }],
                    })
                  }
                >
                  Add color
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {form.colors.map((color, index) => (
                  <div key={`color-${index}`} className="rounded-2xl border border-white/10 p-3">
                    <div className="grid gap-3 md:grid-cols-[1fr_110px_72px]">
                      <input
                        className="h-10 rounded-xl border border-white/10 px-3"
                        placeholder="Color name"
                        value={color.name}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            colors: form.colors.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, name: event.target.value } : item,
                            ),
                          })
                        }
                      />
                      <input
                        className="h-10 rounded-xl border border-white/10 px-3"
                        placeholder="#HEX"
                        value={color.hex_code}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            colors: form.colors.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, hex_code: event.target.value } : item,
                            ),
                          })
                        }
                      />
                      <div
                        className="h-10 rounded-xl border border-white/10"
                        style={{ backgroundColor: color.hex_code }}
                        title={color.name}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-[#A8AAA8]">
                        <input
                          type="checkbox"
                          checked={color.active}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              colors: form.colors.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, active: event.target.checked } : item,
                              ),
                            })
                          }
                        />
                        Active
                      </label>
                      <input
                        className="h-9 w-24 rounded-xl border border-white/10 px-3 text-sm"
                        placeholder="Sort"
                        value={String(color.sort_order)}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            colors: form.colors.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, sort_order: Number(event.target.value) || 0 } : item,
                            ),
                          })
                        }
                      />
                      <label className="rounded-full border border-white/10 px-3 py-1 text-xs">
                        {colorUploadingIndex === index ? "Uploading..." : color.image_id ? "Replace color image" : "Optional color image"}
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp,.avif,image/png,image/jpeg,image/webp,image/avif"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            if (file) {
                              void uploadColorImage(index, file);
                            }
                          }}
                        />
                      </label>
                      {color.image_id ? (
                        <button
                          type="button"
                          className="text-xs text-[#A8AAA8]"
                          onClick={() =>
                            setForm({
                              ...form,
                              colors: form.colors.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, image_id: null, preview: "" } : item,
                              ),
                            })
                          }
                        >
                          Remove color image
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="ml-auto text-xs text-red-200"
                        onClick={() =>
                          setForm({
                            ...form,
                            colors: form.colors.filter((_, itemIndex) => itemIndex !== index),
                          })
                        }
                      >
                        Remove color
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <input className="h-11 rounded-2xl border border-white/10 px-4" placeholder="Sort order" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
              Featured in This Month&apos;s Offers
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
              Published
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
    </div>
  );
}
