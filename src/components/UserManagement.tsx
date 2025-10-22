import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  RefreshCw,
  Users,
  Shield,
  Eye,
  PenTool,
  Settings,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Loading } from './ui/loading';
import { EmptyState } from './ui/empty-state';

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'Admin' | 'Writer' | 'View';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
  phone?: string;
  department?: string;
  articles_count?: number;
  login_count?: number;
}

interface UserFormData {
  username: string;
  email: string;
  full_name: string;
  role: 'Admin' | 'Writer' | 'View';
  phone: string;
  department: string;
  password?: string;
}

const roles = [
  { value: 'Admin', label: 'Admin', icon: Shield, description: 'Toàn quyền quản trị' },
  { value: 'Writer', label: 'Writer', icon: PenTool, description: 'Viết và chỉnh sửa bài viết' },
  { value: 'View', label: 'View', icon: Eye, description: 'Chỉ xem nội dung' }
];

const statuses = [
  { value: 'active', label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Không hoạt động', color: 'bg-gray-100 text-gray-800' },
  { value: 'suspended', label: 'Tạm khóa', color: 'bg-red-100 text-red-800' }
];

export const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    full_name: '',
    role: 'View',
    phone: '',
    department: ''
  });

  const itemsPerPage = 10;

  // Mock data for demonstration
  const mockUsers: User[] = [
    {
      id: 'user_phantd',
      username: 'phantd',
      email: 'phan.td@marketingservice.io',
      full_name: 'Phan Thành Đạt',
      role: 'Admin',
      status: 'active',
      created_at: '2025-09-15T08:00:00.000Z',
      last_login: '2025-10-08T08:30:00.000Z',
      phone: '+84 912 345 678',
      department: 'Technology',
      articles_count: 45,
      login_count: 156
    },
    {
      id: 'user_lehien',
      username: 'lehien',
      email: 'le.hien@marketingservice.io',
      full_name: 'Lê Hiền',
      role: 'Writer',
      status: 'active',
      created_at: '2025-09-20T10:15:00.000Z',
      last_login: '2025-10-08T09:30:00.000Z',
      phone: '+84 987 654 321',
      department: 'Content',
      articles_count: 23,
      login_count: 89
    },
    {
      id: 'user_viewonly',
      username: 'viewonly',
      email: 'viewer@marketingservice.io',
      full_name: 'Nguyễn Minh Khôi',
      role: 'View',
      status: 'active',
      created_at: '2025-10-01T14:30:00.000Z',
      last_login: '2025-10-07T16:20:00.000Z',
      phone: '+84 923 456 789',
      department: 'Marketing',
      articles_count: 0,
      login_count: 12
    },
    {
      id: 'user_writer2',
      username: 'writer2',
      email: 'writer2@marketingservice.io',
      full_name: 'Trần Văn An',
      role: 'Writer',
      status: 'inactive',
      created_at: '2025-08-10T09:00:00.000Z',
      last_login: '2025-09-25T14:45:00.000Z',
      phone: '+84 934 567 890',
      department: 'Content',
      articles_count: 12,
      login_count: 34
    },
    {
      id: 'user_suspended',
      username: 'suspended_user',
      email: 'suspended@marketingservice.io',
      full_name: 'Nguyễn Thị Mai',
      role: 'Writer',
      status: 'suspended',
      created_at: '2025-07-15T11:30:00.000Z',
      last_login: '2025-08-20T10:15:00.000Z',
      phone: '+84 945 678 901',
      department: 'Content',
      articles_count: 8,
      login_count: 21
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // In real implementation: GET /api/v1/users
      setTimeout(() => {
        setUsers(mockUsers);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Không thể tải danh sách người dùng');
      setIsLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      full_name: '',
      role: 'View',
      phone: '',
      department: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone || '',
      department: user.department || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const submitUser = async () => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.full_name.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      // In real implementation: POST/PUT /api/v1/users
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingUser) {
        // Update existing user
        setUsers(users.map(u => 
          u.id === editingUser.id 
            ? { 
                ...u, 
                ...formData,
                email: formData.email.toLowerCase()
              } 
            : u
        ));
        toast.success('Đã cập nhật thông tin người dùng thành công');
      } else {
        // Create new user
        const newUser: User = {
          id: `user_${formData.username}`,
          ...formData,
          email: formData.email.toLowerCase(),
          status: 'active',
          created_at: new Date().toISOString(),
          articles_count: 0,
          login_count: 0
        };
        setUsers([newUser, ...users]);
        toast.success('Đã tạo người dùng mới thành công');
      }

      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Không thể lưu thông tin người dùng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsSubmitting(true);
    try {
      // In real implementation: DELETE /api/v1/users/{user_id}
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUsers(users.filter(u => u.id !== userToDelete.id));
      toast.success('Đã xóa người dùng thành công');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Không thể xóa người dùng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    try {
      // In real implementation: PATCH /api/v1/users/{user_id}/status
      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: newStatus as any } : u
      ));
      
      toast.success(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'tạm khóa'} người dùng`);
    } catch (error) {
      toast.error('Không thể thay đổi trạng thái người dùng');
    }
  };

  const getRoleIcon = (role: string) => {
    const roleConfig = roles.find(r => r.value === role);
    return roleConfig ? roleConfig.icon : Settings;
  };

  const getRoleBadge = (role: string) => {
    const colorMap = {
      Admin: 'bg-red-100 text-red-800',
      Writer: 'bg-blue-100 text-blue-800',
      View: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colorMap[role as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statuses.find(s => s.value === status);
    return statusConfig ? (
      <Badge className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    ) : null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 60000) return 'Vừa xong';
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} phút trước`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)} giờ trước`;
    return `${Math.floor(diffMs / 86400000)} ngày trước`;
  };

  // Filter and paginate users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Check if current user has permission to manage users
  const canManageUsers = user?.role === 'Admin';

  if (!canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Truy cập bị từ chối</h2>
        <p className="text-muted-foreground">
          Bạn không có quyền truy cập vào trang quản lý người dùng. 
          Chỉ Admin mới có thể xem và quản lý danh sách người dùng.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Người dùng</h1>
          <p className="text-slate-600 mt-1">
            Quản lý tài khoản và phân quyền người dùng trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredUsers.length} người dùng
          </Badge>
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={handleCreateUser}>
            <UserPlus className="w-4 h-4 mr-2" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Danh sách Người dùng
          </CardTitle>
          <CardDescription>
            Hiển thị {paginatedUsers.length} trên tổng {filteredUsers.length} người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading text="Đang tải danh sách người dùng..." />
          ) : paginatedUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Không có người dùng nào"
              description="Không tìm thấy người dùng nào phù hợp với bộ lọc hiện tại"
              action={{
                label: "Thêm người dùng đầu tiên",
                onClick: handleCreateUser
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Hoạt động</TableHead>
                      <TableHead>Bài viết</TableHead>
                      <TableHead>Đăng nhập cuối</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => {
                      const RoleIcon = getRoleIcon(user.role);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-slate-900">{user.full_name}</div>
                              <div className="text-sm text-muted-foreground">@{user.username}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                              {user.department && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {user.department}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <RoleIcon className="w-4 h-4" />
                              {getRoleBadge(user.role)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(user.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <span>Tạo: {formatDate(user.created_at).split(' ')[0]}</span>
                              </div>
                              <div className="text-muted-foreground">
                                {user.login_count} lần đăng nhập
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium">{user.articles_count}</div>
                              <div className="text-xs text-muted-foreground">bài viết</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div>{getTimeAgo(user.last_login)}</div>
                              {user.last_login && (
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(user.last_login)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => toggleUserStatus(user.id, user.status)}
                                  className={user.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                                >
                                  {user.status === 'active' ? (
                                    <>
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Tạm khóa
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Kích hoạt
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteUser(user)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center pt-4">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 0 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(0, currentPage - 2) + i;
                        if (pageNum >= totalPages) return null;
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={pageNum === currentPage}
                              className="cursor-pointer"
                            >
                              {pageNum + 1}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {currentPage < totalPages - 1 && (
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Cập nhật thông tin và phân quyền cho người dùng.'
                : 'Tạo tài khoản mới và phân quyền cho người dùng.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="username"
                  disabled={!!editingUser}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò *</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <role.icon className="w-4 h-4" />
                          <div>
                            <div>{role.label}</div>
                            <div className="text-xs text-muted-foreground">{role.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Họ và tên *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="user@marketingservice.io"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+84 912 345 678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Phòng ban</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="Technology"
                />
              </div>
            </div>

            {!editingUser && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Mật khẩu mặc định sẽ được gửi qua email. 
                    Người dùng nên đổi mật khẩu ngay lần đăng nhập đầu tiên.
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={submitUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                editingUser ? 'Cập nhật' : 'Tạo mới'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Xác nhận xóa người dùng
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.full_name}</strong> 
                (@{userToDelete?.username})?
              </p>
              
              {userToDelete && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div><strong>Email:</strong> {userToDelete.email}</div>
                    <div><strong>Vai trò:</strong> {userToDelete.role}</div>
                    <div><strong>Bài viết:</strong> {userToDelete.articles_count} bài</div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. 
                  Tất cả dữ liệu liên quan đến người dùng sẽ bị xóa vĩnh viễn.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa người dùng
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};