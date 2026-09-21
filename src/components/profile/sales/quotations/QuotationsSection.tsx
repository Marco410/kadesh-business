"use client";

import { motion, useReducedMotion } from "framer-motion";
import QuotationsListPanel from "./QuotationsListPanel";
import {
  quotationFadeUp,
  quotationMotionTransition,
  quotationStagger,
} from "./motion";

export interface QuotationsSectionProps {
  userId: string;
}

export default function QuotationsSection({ userId }: QuotationsSectionProps) {
  const reduce = useReducedMotion();
  const fadeUp = quotationFadeUp(reduce);

  return (
    <motion.div
      className="space-y-6"
      data-user-id={userId}
      variants={quotationStagger(reduce)}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={fadeUp}
        transition={quotationMotionTransition(reduce)}
      >
        <h3 className="text-xl font-bold tracking-tight text-[#212121] dark:text-white">
          Cotizaciones
        </h3>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
          Crea propuestas con folio y total, y da seguimiento hasta que el
          cliente las acepte o rechace.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        transition={quotationMotionTransition(reduce, 0.04)}
      >
        <QuotationsListPanel userId={userId} />
      </motion.div>
    </motion.div>
  );
}
