import React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"; // chỉnh lại đường dẫn tùy cấu trúc dự án
import { cn, getSubjectColor } from "../lib/utils"; // cần tạo hàm getSubjectColor trong utils
// Use existing public asset as placeholder icons

const CompanionsList = ({ title, companions = [], classNames = "" }) => {
  return (
    <article className={cn("companion-list", classNames)}>
      <h2 className="font-bold text-3xl mb-4">{title}</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-lg w-2/3">Bài học</TableHead>
            <TableHead className="text-lg">Môn học</TableHead>
            <TableHead className="text-lg text-right">Thời lượng</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {companions.length > 0 ? (
            companions.map(({ id, subject, name, topic, duration }) => (
              <TableRow key={id}>
                {/* Cột: Tên và chủ đề bài học */}
                <TableCell>
                  <Link to={`/companions/${id}`}>
                    <div className="flex items-center gap-2">
                      {/* Icon môn học */}
                      <div
                        className={`w-[72px] h-[72px] flex items-center justify-center rounded-lg max-md:hidden ${getSubjectColor(subject)}`}
                      >
                        <img
                          src={`/icons/${subject}.svg`}
                          alt={subject}
                          width={35}
                          height={35}
                          loading="lazy"
                          onError={(e) => (e.target.src = "/vite.svg")}
                        />
                      </div>

                      {/* Tên và chủ đề */}
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-2xl">{name}</p>
                        <p className="text-lg text-gray-600">{topic}</p>
                      </div>
                    </div>
                  </Link>
                </TableCell>

                {/* Cột: Môn học */}
                <TableCell>
                  <div className="subject-badge w-fit max-md:hidden">
                    {subject}
                  </div>

                  {/* Hiển thị icon thay cho text trên mobile */}
                  <div
                    className={`flex items-center justify-center rounded-lg w-fit p-2 md:hidden ${getSubjectColor(subject)}`}
                  >
                    <img
                      src={`/icons/${subject}.svg`}
                      alt={subject}
                      width={18}
                      height={18}
                      loading="lazy"
                      onError={(e) => (e.target.src = "/vite.svg")}
                    />
                  </div>
                </TableCell>

                {/* Cột: Thời lượng */}
                <TableCell>
                  <div className="flex items-center gap-2 w-full justify-end">
                    <p className="text-2xl">
                      {duration} <span className="max-md:hidden">phút</span>
                    </p>
                    <img
                      src="/vite.svg"
                      alt="thời gian"
                      width={14}
                      height={14}
                      className="md:hidden"
                      loading="lazy"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                Chưa có bài học nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </article>
  );
};

export default CompanionsList;
