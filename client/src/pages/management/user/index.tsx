/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { getUsers, getRoles } from 'api/get/get.api'
import Pagination from '../component/Pagination'
import { User, Role } from 'api/get/get.interface'
import UserItem from './component/UserItem'
import { Search } from '@mui/icons-material'
import Modal from '@mui/material/Modal' // Thêm Modal từ MUI
import EditUserModal from './component/EditUserModel'
import { PacmanLoader } from 'react-spinners'
import { useTranslation } from 'react-i18next'

const UserManagementPage: React.FC = () => {
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [search, setSearch] = useState('')
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const searchTitle = t('userManagement.searchTitle')
  const fetchUsers = async (page: number, limit: number, search: string, roleId: number | null): Promise<void> => {
    setLoading(true) // Bắt đầu loading
    try {
      const response = await getUsers({ page, limit, search, roleId })
      setUsers(response.data.data)
      setTotalUsers(response.data.meta.totalUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false) // Kết thúc loading
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
  }, [currentPage, limit])

  useEffect(() => {
    setCurrentPage(1)
    void fetchUsers(1, limit, search, selectedRole)
  }, [selectedRole])

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
    <div className="ml-0 md:py-6 md:px-8 px-2 py-2 bg-sky-100 flex flex-wrap justify-center items-center border-x-2">
      <div className="flex justify-between items-center mb-4 w-full flex-wrap">
        <div className='flex flex-wrap md:flex-nowrap justify-center md:justify-between w-full items-center gap-2 mb-4 p-2'>
          <h2 className="text-4xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-400 to-blue-500">
            {t('userManagement.title')}
          </h2>
          <div className='gap-2 flex w-full lg:w-3/6 items-center flex-wrap lg:flex-nowrap'>
            <div className='flex gap-2 lg:w-1/2 w-full justify-end'>
              <div className='p-2 border-2 rounded-lg shadow-sm bg-white flex items-center'>
                <p>{totalUsers} {t('userManagement.itemName')}</p>
              </div>
              <select
                value={selectedRole ?? ''}
                onChange={handleRoleChange}
                className="p-2 border-2 rounded-md h-11"
              >
                <option value="">{t('userManagement.allRole')}</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.description}</option>
                ))}
              </select>
            </div>
            <div className='flex gap-2 lg:w-1/2 w-full'>
              <input
                type="text"
                placeholder={searchTitle}
                value={search}
                onChange={handleSearchChange}
                className="w-full p-2 border-2 rounded-md focus:outline-none"
              />
              <button onClick={async () => await fetchUsers(currentPage, limit, search, selectedRole)} className="p-2 bg-white rounded-lg border-2 active:scale-95 hover:bg-slate-50">
                <Search className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
        {loading
          ? (
            <div className="flex justify-center items-center w-full min-h-80 mt-15">
              <PacmanLoader
                className='flex justify-center items-center w-full mt-20'
                color='#5EEAD4'
                cssOverride={{
                  display: 'block',
                  margin: '0 auto',
                  borderColor: 'blue'
                }}
                loading
                margin={10}
                speedMultiplier={3}
                size={40}
              />
            </div>
          )
          : users.length === 0
            ? (
              <div className="w-full text-center text-gray-500 mt-4 flex justify-center items-center min-h-80">Không tìm thấy người dùng nào.</div>
            )
            : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-4 gap-4 w-full">
                {users.map(user => (
                  <div key={user.id} onClick={() => handleOpenModal(user)}>
                    <UserItem user={user} />
                  </div>
                ))}
              </div>
            )}
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
            <EditUserModal roles={roles} onClose={handleCloseModal} user={selectedUser} fetchUsers={async () => await fetchUsers(currentPage, limit, search, selectedRole)} />
          )}
        </>
      </Modal>
    </div>
  )
}

export default UserManagementPage
