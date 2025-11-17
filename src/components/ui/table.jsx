"use client";

import React from "react";
import { cn } from "../../lib/utils";

/**
 * 📘 Bảng tổng quát - hỗ trợ responsive, có thể cuộn ngang khi tràn.
 */
function Bang({ className, ...props }) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

/**
 * 🧩 Phần đầu bảng (thead)
 */
function BangHeader({ className, ...props }) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

/**
 * 📄 Phần thân bảng (tbody)
 */
function BangBody({ className, ...props }) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

/**
 * 📊 Phần chân bảng (tfoot)
 */
function BangFooter({ className, ...props }) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

/**
 * 🧱 Một hàng trong bảng (tr)
 */
function BangRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  );
}

/**
 * 📌 Ô tiêu đề của bảng (th)
 */
function BangHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

/**
 * 🔹 Ô dữ liệu trong bảng (td)
 */
function BangCell({ className, ...props }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

/**
 * 📝 Chú thích cho bảng (caption)
 */
function BangCaption({ className, ...props }) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Bang as Table,
  BangHeader as TableHeader,
  BangBody as TableBody,
  BangFooter as TableFooter,
  BangHead as TableHead,
  BangRow as TableRow,
  BangCell as TableCell,
  BangCaption as TableCaption,
};
