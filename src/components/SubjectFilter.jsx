import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { subjects } from "../constants";
import { useNavigate, useLocation } from "react-router-dom";

const SubjectFilter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("subject") || "";

  const [subject, setSubject] = useState(query);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (subject === "all") {
      params.delete("subject");
    } else if (subject) {
      params.set("subject", subject);
    } else {
      params.delete("subject");
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [subject, location.pathname, location.search, navigate]);

  return (
    <Select onValueChange={setSubject} value={subject}>
      <SelectTrigger className="input capitalize">
        <SelectValue placeholder="Chọn môn học" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả môn học</SelectItem>
        {subjects.map((subject) => (
          <SelectItem key={subject} value={subject} className="capitalize">
            {subject}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SubjectFilter;
