import api from "./api";

// Danh sách
export const getCourses = async (params = {}) => {
  const { data } = await api.get(`/courses/getCourses`);
  let items = Array.isArray(data) ? data : data.items || [];
  
  // Client-side filtering
  if (params.q) {
    const search = params.q.toLowerCase();
    items = items.filter(c => 
      c.title?.toLowerCase().includes(search) || 
      c.description?.toLowerCase().includes(search)
    );
  }
  
  if (params.category) {
    items = items.filter(c => c.category?._id === params.category || c.category === params.category);
  }
  
  // Client-side sorting
  if (params.sort) {
    const sortField = params.sort.startsWith('-') ? params.sort.slice(1) : params.sort;
    const sortOrder = params.sort.startsWith('-') ? -1 : 1;
    
    items = [...items].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'title') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      } else if (sortField === 'price' || sortField === 'createdAt') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }
      
      if (aVal < bVal) return -1 * sortOrder;
      if (aVal > bVal) return 1 * sortOrder;
      return 0;
    });
  }
  
  const total = items.length;
  const page = params.page || 1;
  const limit = params.limit || 12;
  const start = (page - 1) * limit;
  const paginatedItems = items.slice(start, start + limit);
  
  return { items: paginatedItems, total, page, limit };
};

// Chi tiết
export const getCourseById = async (id) => {
  const { data } = await api.get(`/courses/getCourseById/${id}`);
  return data;
};

// (tùy chọn) Ghi danh
export const enrollCourse = async (id) => {
  const { data } = await api.post(`/enrollments`, { courseId: id });
  return data;
};
