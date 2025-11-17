import React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form"

import { cn } from "../../lib/utils"
import { Label } from "./label"

// 🧾 Component cha của toàn bộ form (dùng context của react-hook-form)
const Form = FormProvider

// 🧠 Context để lưu tên của từng trường trong form
const FormFieldContext = React.createContext({})

// 🔹 Component đại diện cho một trường trong form (field)
const FormField = (props) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

// ⚙️ Hook giúp lấy thông tin của một field trong form (VD: lỗi, id,...)
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("⚠️ useFormField phải được sử dụng bên trong <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

// 🧱 Context của từng phần tử form (FormItem)
const FormItemContext = React.createContext({})

// 🔹 Một nhóm phần tử trong form (label, input, mô tả, lỗi)
function FormItem({ className, ...props }) {
  const id = React.useId() // Tạo id duy nhất cho mỗi phần tử

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

// 🏷️ Nhãn (Label) của ô nhập liệu
function FormLabel({ className, ...props }) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

// 🧩 Vùng chứa phần điều khiển nhập liệu (Input, Select, Textarea,...)
function FormControl(props) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

// 📝 Mô tả nhỏ bên dưới ô nhập
function FormDescription({ className, ...props }) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

// ⚠️ Thông báo lỗi khi nhập sai
function FormMessage({ className, ...props }) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) return null

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
}

// 🚀 Xuất các component để dùng nơi khác
export {
  useFormField,     // Hook để lấy thông tin field
  Form,             // Component form tổng thể
  FormItem,         // Một phần tử trong form
  FormLabel,        // Nhãn label
  FormControl,      // Vùng điều khiển input
  FormDescription,  // Mô tả nhỏ
  FormMessage,      // Thông báo lỗi
  FormField,        // Field có logic validation
}
