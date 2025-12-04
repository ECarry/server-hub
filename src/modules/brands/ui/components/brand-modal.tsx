/* eslint-disable @next/next/no-img-element */
"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/responsive-modal";
import { useFileUpload } from "@/modules/s3/hooks/use-file-upload";
import { useRef, useEffect, useMemo } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { Textarea } from "@/components/ui/textarea";
import { useWatch } from "react-hook-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId?: string;
  initialData?: {
    name: string;
    fullName?: string | null;
    description?: string | null;
    logoImageKey?: string | null;
  };
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fullName: z.string().optional(),
  description: z.string().optional(),
  logoImageKey: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const BrandModal = ({ open, onOpenChange, brandId, initialData }: Props) => {
  const isEditMode = !!brandId;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      fullName: "",
      description: "",
      logoImageKey: "",
    },
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading } = useFileUpload();

  // Update form when modal opens with initial data
  useEffect(() => {
    if (initialData && isEditMode && open) {
      form.reset({
        name: initialData.name || "",
        fullName: initialData.fullName || "",
        description: initialData.description || "",
        logoImageKey: initialData.logoImageKey || "",
      });
    }
  }, [initialData, isEditMode, open, form]);

  // Watch logoImageKey changes for preview using useWatch
  const logoImageKey = useWatch({
    control: form.control,
    name: "logoImageKey",
  });

  // Compute logo preview from logoImageKey
  const logoPreview = useMemo(() => {
    return logoImageKey ? keyToUrl(logoImageKey) : "";
  }, [logoImageKey]);

  const create = useMutation(
    trpc.brands.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Brand created successfully");
        handleClose();
        await queryClient.invalidateQueries(
          trpc.brands.getMany.queryOptions({})
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const update = useMutation(
    trpc.brands.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Brand updated successfully");
        handleClose();
        await queryClient.invalidateQueries(
          trpc.brands.getMany.queryOptions({})
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const deleteFile = useMutation(trpc.s3.deleteFile.mutationOptions());

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      try {
        await uploadFile(file, {
          folder: "logos",
          onSuccess: async (uploadedKey) => {
            form.setValue("logoImageKey", uploadedKey);
          },
        });
      } catch (error) {
        console.error("Upload failed:", error);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeLogo = async () => {
    const currentKey = form.getValues("logoImageKey");
    if (currentKey) {
      try {
        await deleteFile.mutateAsync({ key: currentKey });
        toast.success("Logo deleted");
      } catch (error) {
        console.error("Failed to delete logo from S3:", error);
        toast.error("Failed to delete logo");
      }
    }
    form.setValue("logoImageKey", "");
  };

  const onSubmit = (data: FormValues) => {
    if (isEditMode && brandId) {
      update.mutate({ id: brandId, ...data });
    } else {
      create.mutate(data);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={handleClose}
      title={isEditMode ? "Edit Brand" : "Create a Brand"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter brand name"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter brand full name"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter brand description"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="logoImageKey"
            render={() => (
              <FormItem>
                <FormLabel>Logo (Optional)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {logoPreview ? (
                      <div className="relative w-32 h-32 rounded-md overflow-hidden border bg-muted">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={removeLogo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="size-4 mr-2" />
                            Upload Logo
                          </>
                        )}
                      </Button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            disabled={create.isPending || update.isPending}
            type="submit"
            className="w-full"
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
