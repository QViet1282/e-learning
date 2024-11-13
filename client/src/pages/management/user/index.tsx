/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { getUsers, getRoles } from 'api/get/get.api'
import Pagination from '../course/components/Pagination'
import { User, Role } from 'api/get/get.interface'
import UserItem from './component/UserItem'
import { Search } from '@mui/icons-material'
import Modal from '@mui/material/Modal' // Thêm Modal từ MUI
import EditUserModal from './component/EditUserModel'

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(9)
  const [search, setSearch] = useState('')
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const [openModal, setOpenModal] = useState(false) // State để mở modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null) // State cho người dùng được chọn

  const fetchUsers = async (page: number, limit: number, search: string, roleId: number | null) => {
    try {
      const response = await getUsers({ page, limit, search, roleId })
      setUsers(response.data.data)
      setTotalUsers(response.data.meta.totalUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await getRoles()
      setRoles(response.data)
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  useEffect(() => {
    void fetchRoles()
    void fetchUsers(currentPage, limit, search, selectedRole)
  }, [currentPage, limit]) // Cập nhật khi role hoặc pagination thay đổi

  useEffect(() => {
    setCurrentPage(1) // Reset về trang 1 khi tìm kiếm thay đổi
    void fetchUsers(1, limit, search, selectedRole) // Tìm kiếm khi search thay đổi
  }, [selectedRole]) // Chỉ cần theo dõi thay đổi của search và selectedRole

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value.length > 0 ? parseInt(event.target.value, 10) : null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleOpenModal = (user: User) => {
    setSelectedUser(user)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedUser(null)
  }

  const totalPages = Math.ceil(totalUsers / limit)

  return (
    <div className="ml-0 md:ml-14 py-8 md:px-8 px-2 bg-slate-100 min-h-96 flex flex-wrap justify-center items-center">
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400 mb-4">
        User Management
      </h2>
      <div className="flex justify-between items-center mb-4 w-full flex-wrap">
        <div className='flex md:flex-nowrap justify-start items-center gap-2 mb-4 p-2 shadow-lg rounded-lg'>
          <select
            value={selectedRole ?? ''}
            onChange={handleRoleChange}
            className="p-2 border border-gray-300 rounded-md h-11"
          >
            <option value="">Tất cả vai trò</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.description}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={search}
            onChange={handleSearchChange}
            className="lg:w-auto w-full p-2 border border-gray-300 rounded-md"
          />
          <button onClick={async () => await fetchUsers(currentPage, limit, search, selectedRole)} className="p-2 bg-white rounded-lg">
            <Search className="text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {users.map(user => (
            <div key={user.id} onClick={() => handleOpenModal(user)}>
              <UserItem user={user} />
            </div>
          ))}
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modal để hiển thị thông tin chi tiết của người dùng */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <>
          {(selectedUser != null) && (
              <EditUserModal roles={roles} onClose={handleCloseModal} user={selectedUser} />
          )}
        </>
      </Modal>
    </div>
  )
}

export default UserManagementPage
