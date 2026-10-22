import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMPANY_SIZES, leadFormSchema, type LeadFormValues } from "@/lib/lead-schema";
import { submitLead } from "@/lib/leads.functions";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { publicSettingsQuery } from "@/lib/public-settings";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  answersCode: string;
}

type Success = { score: number; classification: string; company: string; name: string };

export function LeadDialog({ open, onOpenChange, answersCode }: Props) {
  const submissionId = useMemo(() => crypto.randomUUID(), [answersCode]);
  const inFlight = useRef(false);
  const [success, setSuccess] = useState<Success | null>(null);
  const settings = useQuery(publicSettingsQuery);
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "", company: "", whatsapp: "", email: "", main_concern: "",
      consent_contact: false as unknown as true, consent_marketing: false, website: "",
    },
  });
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = form;

  async function onSubmit(values: LeadFormValues) {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await submitLead({ data: { ...values, submission_id: submissionId, answers: answersCode } });
      if (res.ok) setSuccess(res);
      else toast.error(res.error);
    } catch {
      toast.error("Não foi possível enviar. Verifique os dados e tente novamente.");
    } finally {
      inFlight.current = false;
    }
  }

  const waLink = success ? buildWhatsAppLink(settings.data?.whatsapp_number, success) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {success ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <DialogHeader className="mt-4 text-center sm:text-center">
              <DialogTitle>Solicitação registrada!</DialogTitle>
              <DialogDescription>
                Obrigado, {success.name.split(" ")[0]}. Entraremos em contato pelo WhatsApp informado.
              </DialogDescription>
            </DialogHeader>
            {waLink ? (
              <Button asChild variant="brand" size="lg" className="mt-6 w-full">
                <a href={waLink} target="_blank" rel="noopener noreferrer"><MessageCircle /> Conversar no WhatsApp</a>
              </Button>
            ) : settings.isLoading ? null : (
              <p className="mt-6 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                O atendimento por WhatsApp ainda não está disponível, mas sua solicitação foi salva e você receberá contato.
              </p>
            )}
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Solicitar orientação personalizada</DialogTitle>
              <DialogDescription>Deixe seus dados e um especialista entrará em contato.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-2 grid gap-4" noValidate>
              <Field id="name" label="Nome completo" error={errors.name?.message}>
                <Input id="name" autoComplete="name" maxLength={120} {...register("name")} />
              </Field>
              <Field id="company" label="Nome da empresa" error={errors.company?.message}>
                <Input id="company" autoComplete="organization" maxLength={120} {...register("company")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="whatsapp" label="WhatsApp" error={errors.whatsapp?.message}>
                  <Input id="whatsapp" type="tel" inputMode="tel" placeholder="(11) 98765-4321" maxLength={25} {...register("whatsapp")} />
                </Field>
                <Field id="email" label="E-mail (opcional)" error={errors.email?.message}>
                  <Input id="email" type="email" autoComplete="email" maxLength={254} {...register("email")} />
                </Field>
              </div>
              <Field id="company_size" label="Quantidade de colaboradores" error={errors.company_size?.message}>
                <Select onValueChange={(v) => setValue("company_size", v as LeadFormValues["company_size"], { shouldValidate: true })}>
                  <SelectTrigger id="company_size"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field id="main_concern" label="Principal preocupação (opcional)" error={errors.main_concern?.message}>
                <Textarea id="main_concern" rows={3} maxLength={500} {...register("main_concern")} />
              </Field>
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Site</label>
                <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="consent_contact" checked={watch("consent_contact") === true}
                  onCheckedChange={(c) => setValue("consent_contact", (c === true) as true, { shouldValidate: true })} />
                <Label htmlFor="consent_contact" className="text-sm font-normal leading-snug">
                  Autorizo o contato sobre a orientação solicitada e declaro que li a{" "}
                  <Link to="/privacidade" target="_blank" className="text-brand underline">Política de Privacidade</Link>.
                </Label>
              </div>
              {errors.consent_contact && <p className="-mt-2 text-sm text-destructive">{errors.consent_contact.message}</p>}
              <div className="flex items-start gap-3">
                <Checkbox id="consent_marketing" checked={watch("consent_marketing")}
                  onCheckedChange={(c) => setValue("consent_marketing", c === true)} />
                <Label htmlFor="consent_marketing" className="text-sm font-normal leading-snug">
                  Quero receber novidades e conteúdos de segurança digital.
                </Label>
              </div>
              <Button type="submit" variant="brand" size="lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />} Enviar solicitação
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive" id={`${id}-error`}>{error}</p>}
    </div>
  );
}
