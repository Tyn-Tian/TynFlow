"use client";

import { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface CalculatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (value: number) => void;
  initialValue?: number;
  title?: string;
  description?: string;
}

export function CalculatorDialog({
  open,
  onOpenChange,
  onInsert,
  initialValue = 0,
  title = "Calculator",
  description,
}: CalculatorDialogProps) {
  const [calcExpr, setCalcExpr] = useState<string>(String(initialValue ?? 0));
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setCalcExpr(String(initialValue ?? 0));
    }
  }

  const pressCalc = useCallback((value: string) => {
    if (value === "C") return setCalcExpr("0");
    if (value === "DEL")
      return setCalcExpr((current) =>
        current.length <= 1 ? "0" : current.slice(0, -1)
      );
    setCalcExpr((current) => (current === "0" ? value : current + value));
  }, []);

  const evalCalc = useCallback(() => {
    setCalcExpr((currentExpr) => {
      try {
        const result = Function(`"use strict";return (${currentExpr})`)();
        return String(Number.isFinite(result) ? result : 0);
      } catch {
        return "0";
      }
    });
  }, []);

  const calcResultValue = useCallback((expressionToEval: string) => {
    try {
      let expression = String(expressionToEval);
      while (expression.length && /[+\-*/\.]$/.test(expression))
        expression = expression.slice(0, -1);
      if (!expression) return 0;
      const result = Function(`"use strict";return (${expression})`)();
      return Math.max(
        0,
        Math.round(Number.isFinite(result) ? Number(result) : 0)
      );
    } catch {
      return 0;
    }
  }, []);

  const formatExprForDisplay = (expression: string) => {
    return expression.replace(/\d+(?:\.\d+)?/g, (match) => {
      try {
        const number = Number(match);
        if (Number.isNaN(number)) return match;
        return number.toLocaleString("id-ID");
      } catch {
        return match;
      }
    });
  };

  const handleInsert = useCallback(() => {
    onInsert(calcResultValue(calcExpr));
    onOpenChange(false);
  }, [calcExpr, onInsert, onOpenChange, calcResultValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        pressCalc(key);
      } else if (key === "+" || key === "-" || key === "*" || key === "/") {
        pressCalc(key);
      } else if (key === "=") {
        evalCalc();
      } else if (key === "Enter") {
        if (e.target instanceof HTMLElement && e.target.tagName !== "BUTTON") {
          e.preventDefault();
          evalCalc();
        }
      } else if (key === "Backspace") {
        pressCalc("DEL");
      } else if (key.toLowerCase() === "c") {
        pressCalc("C");
      }
    },
    [pressCalc, evalCalc]
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-96" onKeyDown={handleKeyDown}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <div className="mb-4 overflow-hidden text-right text-2xl font-medium">
          {formatExprForDisplay(calcExpr)}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            "C",
            "DEL",
            "/",
            "*",
            "7",
            "8",
            "9",
            "-",
            "4",
            "5",
            "6",
            "+",
            "1",
            "2",
            "3",
            "=",
            "0",
          ].map((key) => (
            <Button
              key={key}
              type="button"
              onClick={() => {
                if (key === "DEL") pressCalc("DEL");
                else if (key === "C") pressCalc("C");
                else if (key === "=") evalCalc();
                else pressCalc(key);
              }}
              className={
                key === "C"
                  ? "bg-rose-500 text-white hover:bg-rose-500 hover:text-white"
                  : ""
              }
            >
              {key}
            </Button>
          ))}
          <Button
            type="button"
            className="col-span-3 cursor-pointer"
            onClick={handleInsert}
          >
            Rp {calcResultValue(calcExpr).toLocaleString("id-ID")}
          </Button>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Close
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleInsert}
            className="cursor-pointer"
          >
            Insert
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
