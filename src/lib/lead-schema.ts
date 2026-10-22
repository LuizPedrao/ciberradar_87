import { z } from "zod";
import { normalizeBrPhone } from "./whatsapp";

export const COMPANY_SIZES = [
  { value: "1-5", label: "1 a 5" },
  { value: "6-20", label: "6 a 20" },
  { value: "21-50", label: "21 a 50" },
  { value: "51-100", label: "51 a 100" },
  { value: "100+", label: "Mais de 100" },
] as const;

const SAFE_TEXT = /^[^<>{}\\]*$/;
const safe = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} deve ter ao menos ${min} caracteres`)
    .max(max, `${label} deve ter no máximo ${max} caracteres`)
    .regex(SAFE_TEXT, `${label} contém caracteres não permitidos`);

export const leadFormSchema = z.object({
  name: safe(2, 120, "Nome"),
  company: safe(2, 120, "Empresa"),
  whatsapp: z
    .string()
    .trim()
    .max(25, "Telefone inválido")
    .refine((v) => normalizeBrPhone(v) !== null, "Informe um WhatsApp brasileiro válido com DDD"),
  email: z
    .string()
    .trim()
    .max(254, "E-mail muito longo")
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  company_size: z.enum(["1-5", "6-20", "21-50", "51-100", "100+"], {
    errorMap: () => ({ message: "Selecione a quantidade de colaboradores" }),
  }),
  main_concern: z
    .string()
    .trim()
    .max(500, "Máximo de 500 caracteres")
    .regex(SAFE_TEXT, "Contém caracteres não permitidos")
    .optional()
    .or(z.literal("")),
  consent_contact: z.literal(true, {
    errorMap: () => ({ message: "É necessário autorizar o contato" }),
  }),
  consent_marketing: z.boolean(),
  website: z.string().max(200).optional(), // honeypot
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const submitLeadSchema = leadFormSchema.extend({
  submission_id: z.string().uuid(),
  answers: z.string().length(10).regex(/^[snx]{10}$/),
});
