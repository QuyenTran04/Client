import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { subjects } from "../constants";
import { createCompanion } from "../lib/actions/companion.actions";
import { useNavigate } from "react-router-dom";

// ✅ Schema kiểm tra dữ liệu với Zod
const formSchema = z.object({
  name: z.string().min(1, { message: "Vui lòng nhập tên trợ lý học tập." }),
  subject: z.string().min(1, { message: "Vui lòng chọn môn học." }),
  topic: z.string().min(1, { message: "Vui lòng nhập chủ đề hỗ trợ." }),
  voice: z.string().min(1, { message: "Vui lòng chọn giọng nói." }),
  style: z.string().min(1, { message: "Vui lòng chọn phong cách hội thoại." }),
  duration: z
    .coerce.number()
    .min(1, { message: "Vui lòng nhập thời lượng tối thiểu là 1 phút." }),
});

const CompanionForm = () => {
  const navigate = useNavigate();

  // ✅ Khởi tạo form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      topic: "",
      voice: "",
      style: "",
      duration: 15,
    },
  });

  // ✅ Xử lý khi gửi form
  const onSubmit = async (values) => {
    const companion = await createCompanion(values);

    if (companion && companion.id) {
      navigate(`/companions/${companion.id}`);
    } else {
      console.error("Tạo trợ lý thất bại.");
      navigate("/");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-6 rounded-xl shadow-md"
      >
        {/* Tên trợ lý */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên trợ lý học tập</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập tên cho trợ lý học tập của bạn"
                  {...field}
                  className="input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Môn học */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Môn học</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="input capitalize">
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject}
                        value={subject}
                        className="capitalize"
                      >
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Chủ đề hỗ trợ */}
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trợ lý sẽ giúp bạn về chủ đề gì?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ví dụ: Đạo hàm và tích phân"
                  {...field}
                  className="input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Giọng nói */}
        <FormField
          control={form.control}
          name="voice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giọng nói</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="input">
                    <SelectValue placeholder="Chọn giọng nói" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phong cách hội thoại */}
        <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phong cách hội thoại</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="input">
                    <SelectValue placeholder="Chọn phong cách" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Trang trọng</SelectItem>
                    <SelectItem value="casual">Thân mật</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thời lượng */}
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thời lượng ước tính (phút)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="15"
                  {...field}
                  className="input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nút submit */}
        <Button type="submit" className="w-full cursor-pointer">
          Tạo Trợ Lý Học Tập
        </Button>
      </form>
    </Form>
  );
};

export default CompanionForm;
