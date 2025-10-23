// HeaderLayout.jsx - Clean Component (User Logic Only)
import React from "react";
import { FormProvider, FormTextField } from "form4antdesign";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../app/hooks/useAuth";
import { AppstoreOutlined, UnlockOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Avatar, Dropdown, Modal } from "antd";

import { SiGooglegemini } from "react-icons/si";
import { VideoCameraOutlined } from '@ant-design/icons';
import Loginpage from "../../../features/LoginPage/views/LoginPage.jsx";
import { useDropdownMenu } from "../../../app/hooks/useDropdownMenu";
import { useNavbarActions } from "../../../app/hooks/useNavbarAction";
import { getAvatarMenuItems, groupMenuOptions } from "../../api/menuConfig.jsx";

import { AvatarMenuItem } from "../AvatarMenuItem.jsx";
import { useSearchMovie } from "../../../app/hooks/useSearchMovie";
import { useSearchDropdown } from "../../../app/hooks/useSearchDropdown";
import { SearchDropdownItem } from "../SearchDropdownItem.jsx";
import logo2 from "../../../assets/logo2.svg";
const Navbar = () => {
  const methods = useForm({
    defaultValues: { moviesSearch: "" }
  });
  const movieSearchValue = methods.watch("moviesSearch");
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdown = useDropdownMenu();
  const { handleMenuAction, handleGroupOption, modal, closeModal } = useNavbarActions();
  const { searchResults, loading, error, clearSearch, searchingService } = useSearchMovie(movieSearchValue);

  const handleModalClose = () => {
    closeModal();
  };
  const {
    isOpen,
    inputRef,
    selectedIndex,
    dropdownRef,
    openDropdown,
    closeDropdown,
    handleMovieSelect,
    handleViewAllResults,
    shouldShowDropdown
  } = useSearchDropdown();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    methods.setValue("moviesSearch", value);

    if (value && value.length >= 2) {
      openDropdown();
    } else {
      closeDropdown();
      clearSearch();
    }
  };

  const handleClearSearch = () => {
    methods.setValue("moviesSearch", "");
    closeDropdown();
    clearSearch();
  };

  // Transform business config to UI format
  const menuItems = getAvatarMenuItems(handleMenuAction).map(item => ({
    key: item.key,
    label: <AvatarMenuItem icon={item.icon} label={item.label} />,
    onClick: item.action
  }));
  const groupMenuItems = groupMenuOptions(handleGroupOption).map(item => ({
    key: item.key,
    label: <AvatarMenuItem icon={item.icon} label={item.label} />,
    onClick: item.action
  }));

  return (
    <section className="header-section container flex items-center justify-between h-16">
      <div className="logo flex items-center gap-3">

        <img
          src={logo2}
          alt="MovieApp Logo"
          className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        />
        {user ? (
          <FormProvider methods={methods}>
            <div className="logo-text flex items-center relative" ref={dropdownRef}>
              <FormTextField
                name="moviesSearch"
                placeholder="Gemini giúp bạn tìm film bạn muốn..."
                prefix={loading ? <LoadingOutlined /> : <SiGooglegemini />}
                allowClear={false}
                onChange={handleSearchChange}
                className="!w-120 !rounded-full !bg-gray-800 !text-white !placeholder-gray-400"
                ref={inputRef}
              />
              {shouldShowDropdown(movieSearchValue, searchResults?.length > 0 || loading || error) && (
                <SearchDropdownItem
                  loading={loading}
                  error={error}
                  searchResults={searchResults}
                  movieSearchValue={movieSearchValue}
                  selectedIndex={selectedIndex}
                  onMovieSelect={handleMovieSelect}
                  onViewAllResults={() => handleViewAllResults(movieSearchValue)}
                  searchingService={searchingService}
                />
              )}
            </div>
          </FormProvider>
        ) : (<div></div>)}
      </div>
      <Modal
        title={
          <div className="text-center text-2xl font-semibold ">
            <div>
              <UnlockOutlined />
            </div>
            Đăng nhập đi anh? Tên gì đó...

          </div>
        }
        closable={false}
        open={modal}
        onCancel={handleModalClose}
        footer={null}
        style={{ width: "100%" }}
      >
        <Loginpage
          closeModal={closeModal}
        />
      </Modal >
      <div className="flex items-center gap-4">
        {user ? (
          <Dropdown
            menu={{ items: menuItems }}
            placement="bottom"
            trigger={['hover', 'click']}
          >
            <Avatar
              className="!bg-white cursor-pointer"
              onClick={dropdown.toggle}
              style={{
                color: '#f56a00',
                backgroundColor: '#fde3cf',
                fontWeight: "600",
                fontSize: "16px",
                border: "1px solid #f56a00"
              }}
            >
              {user.username.charAt(0)}
            </Avatar>
          </Dropdown>
        ) : (
          <Dropdown
            menu={{ items: groupMenuItems }}
            placement="bottom"
            trigger={['hover', 'click']}
          >
            <Button type="link">
              <AppstoreOutlined className="text-2xl !text-white pointer" />
            </Button>
          </Dropdown>
        )}
      </div>
    </section>
  );
};

export default Navbar;