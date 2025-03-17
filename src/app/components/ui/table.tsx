import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  wrapperClass?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>( // Table component
  ({ className, wrapperClass, ...props }, ref) => (
    <div className={cn("overflow-x-auto", wrapperClass)}>
      <table
        ref={ref}
        className={cn(
          "w-full caption-top text-sm border border-gray-300", // Border added
          "rounded-t-lg",
          className
        )}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement>;

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableSectionProps
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, TableSectionProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  TableSectionProps
>(({ className, ...props }, ref) => ( // Table Footer component
  <tfoot
    ref={ref}
    className={cn("bg-muted font-medium", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>( // Table Row component
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-gray-300 transition-colors data-[state=selected]:bg-muted", // Border applied here
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

type TableHeadProps = React.ThHTMLAttributes<HTMLTableHeaderCellElement>;

const TableHead = React.forwardRef<HTMLTableHeaderCellElement, TableHeadProps>( // Table Header Cell component
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-14 px-4 text-center align-middle font-semibold text-sm text-default-800 capitalize  border-gray-300", // Border applied
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

// Corrected TableCell to support href or onClick
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  href?: string; // Optional prop for link navigation
  onClick?: () => void; // Optional prop for custom click handling
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>( // Table Cell component
  ({ className, href, onClick, children, ...props }, ref) => {
    const content = (
      <td
        ref={ref}
        className={cn(
          "p-4 align-middle text-sm text-default-600 rtl:last:text-left font-normal border-b border-gray-300", // Border applied
          className
        )}
        {...props}
      >
        {children}
      </td>
    );

    // If href is provided, wrap with Link for navigation
    if (href) {
      return (
        <Link href={href} passHref>
          {content} {/* Link automatically wraps with <a> tag */}
        </Link>
      );
    }

    // If onClick is provided, wrap the content in a clickable cell
    if (onClick) {
      return (
        <td
          ref={ref}
          className={cn(
            "p-4 align-middle text-sm text-default-600 last:text-center rtl:last:text-left font-normal cursor-pointer border-b border-gray-300", // Border applied
            className
          )}
          onClick={onClick}
          {...props}
        >
          {children}
        </td>
      );
    }

    return content; // Default non-link behavior
  }
);

TableCell.displayName = "TableCell";

type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>;

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ className, ...props }, ref) => ( // Table Caption component
  <caption
    ref={ref}
    className={cn(
      "mb-4 text-sm font-medium text-default-700 text-start",
      className
    )}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
