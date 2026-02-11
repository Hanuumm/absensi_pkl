"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, AlertCircle, CheckCircle2, Camera, X, ImageIcon } from "lucide-react";
import Image from "next/image";

interface AttendanceFormProps {
  todayAttendance: {
    status: string;
    description: string | null;
    checkInTime: string;
    photo: string | null;
  } | null;
  onSuccess: () => void;
}

export function AttendanceForm({ todayAttendance, onSuccess }: AttendanceFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitted = !!todayAttendance;

  const statusOptions = [
    { value: "HADIR", label: "Hadir", icon: Check, color: "bg-green-500" },
    { value: "IZIN", label: "Izin", icon: Clock, color: "bg-yellow-500" },
    { value: "SAKIT", label: "Sakit", icon: AlertCircle, color: "bg-red-500" },
  ];

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Tipe file tidak valid. Gunakan JPG, PNG, atau WebP");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  }

  function removePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function uploadPhoto(): Promise<string | null> {
    if (!photoFile) return null;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", photoFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      return data.photoUrl;
    } catch (err) {
      throw err;
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit() {
    if (!selectedStatus || isSubmitted) return;

    if ((selectedStatus === "IZIN" || selectedStatus === "SAKIT") && !description.trim()) {
      setError("Keterangan wajib diisi untuk izin/sakit");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload photo first if exists
      let photoUrl: string | null = null;
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus, description, photo: photoUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      onSuccess();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const checkInTime = todayAttendance
    ? new Date(todayAttendance.checkInTime).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Card className={isSubmitted ? "border-green-200 bg-green-50/50" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Absensi Hari Ini</CardTitle>
          {isSubmitted && (
            <Badge className="bg-green-500 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Sudah Absen
            </Badge>
          )}
        </div>
        {isSubmitted && (
          <p className="text-sm text-muted-foreground">
            Anda sudah melakukan absensi pukul {checkInTime}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {statusOptions.map((option) => {
            const isSelected = isSubmitted
              ? todayAttendance?.status === option.value
              : selectedStatus === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={isSubmitted}
                onClick={() => {
                  if (isSubmitted) return;
                  setSelectedStatus(option.value);
                  if (option.value === "HADIR") setDescription("");
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border"
                } ${
                  isSubmitted
                    ? "cursor-not-allowed opacity-60"
                    : "hover:border-primary/50"
                } ${isSubmitted && isSelected ? "opacity-100 !border-green-500 !bg-green-100" : ""}`}
              >
                <div
                  className={`mx-auto h-10 w-10 rounded-full ${option.color} text-white flex items-center justify-center mb-2 ${
                    isSubmitted && !isSelected ? "opacity-40" : ""
                  }`}
                >
                  <option.icon className="h-5 w-5" />
                </div>
                <span className={`font-medium ${isSubmitted && !isSelected ? "opacity-40" : ""}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Show textarea for IZIN/SAKIT */}
        {((!isSubmitted && (selectedStatus === "IZIN" || selectedStatus === "SAKIT")) ||
          (isSubmitted && (todayAttendance?.status === "IZIN" || todayAttendance?.status === "SAKIT"))) && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Keterangan {!isSubmitted && <span className="text-destructive">*</span>}
            </label>
            <Textarea
              placeholder={
                isSubmitted
                  ? ""
                  : `Masukkan alasan ${selectedStatus?.toLowerCase()}...`
              }
              value={isSubmitted ? todayAttendance?.description || "" : description}
              onChange={(e) => !isSubmitted && setDescription(e.target.value)}
              disabled={isSubmitted}
              rows={3}
              className={isSubmitted ? "bg-muted cursor-not-allowed" : ""}
            />
          </div>
        )}

        {/* Photo Upload Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Foto Absensi
          </label>

          {isSubmitted ? (
            // Show submitted photo
            todayAttendance?.photo ? (
              <div className="relative w-full max-w-xs">
                <Image
                  src={todayAttendance.photo}
                  alt="Foto absensi"
                  width={300}
                  height={200}
                  className="rounded-lg border object-cover"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada foto</p>
            )
          ) : (
            // Photo upload input
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />

              {photoPreview ? (
                <div className="relative inline-block">
                  <Image
                    src={photoPreview}
                    alt="Preview foto"
                    width={200}
                    height={150}
                    className="rounded-lg border object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-primary">Klik untuk upload</span> atau drag & drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                  </div>
                </label>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitted || !selectedStatus || loading || uploadingPhoto}
          className="w-full"
        >
          {isSubmitted
            ? "Absensi Sudah Terkirim"
            : uploadingPhoto
            ? "Mengupload foto..."
            : loading
            ? "Memproses..."
            : "Submit Absensi"}
        </Button>
      </CardContent>
    </Card>
  );
}
