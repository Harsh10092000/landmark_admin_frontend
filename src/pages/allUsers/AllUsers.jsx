import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Snackbar,
  } from "@mui/material";
  import React, { useState, useEffect, useMemo, useRef } from "react";
  import { useContext } from "react";
  import { AuthContext } from "../../context2/AuthContext";
  import axios from "axios";
  import { Link, useNavigate } from "react-router-dom";
  import TableHead from "../../components/Table/TableHead";
  import { DateFormat } from "../../components/Functions";
  import "../../components/Table/table.css";
  import Filter from "../../components/Table/Filter";
  import SearchBar from "../../components/Table/SearchBar";
  
  import SkeletonTable from "../../components/Table/SkeletonTable";
  import NoData from "../../components/Table/NoData";
  import TablePagination from "../../components/Table/TablePagination";
  import {
    ArrowDown,
    ArrowUp,
    DeleteIcon,
    EditIcon,
    ViewIcon,
  } from "../../components/SvgIcons";
  import DeleteDialog from "../../components/dialogComp/DeleteDialog";
  import Loader from "../../components/loader/Loader";
  
  
  const ActionDropdownMenu = [
    { to: "/viewUser", title: "View User", icon: <ViewIcon /> },
    { to: "/editUser", title: "Edit User", icon: <EditIcon /> },
    { to: "/deleteUser", title: "Delete User", icon: <DeleteIcon /> },
  ];
  
  const ActionBtnDropdown = ({ userId, selectedItem, onAction }) => {
    return (
      <div className="action-dropdown css-1dhh8jv">
        <span className="css-1egvoax"></span>
        {ActionDropdownMenu.map((item) => (
          <div
            key={item.title}
            className={`action-dropdown-item ${
              selectedItem === item.title ? "selected-action" : ""
            }`}
            onClick={() => onAction(userId, item.title, item.to)}
          >
            <span className="action-dropdown-icon">{item.icon}</span> {item.title}
          </div>
        ))}
      </div>
    );
  };
  
  const AllUsers = () => {
    const [selectedItem, setSelectedItem] = useState(null);
    const { currentUser } = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const [data, setData] = useState([]);
    const [snackQ, setSnackQ] = useState(false);
    const [snack, setSnack] = useState(false);
    const [loader, setLoader] = useState(false);
    const [change, setChange] = useState(0);
    const [selectedAction, setSelectedAction] = useState();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [snackDel, setSnackDel] = useState(false);
  
    const [searchValue, setSearchValue] = useState("");
    const [filter, setFilter] = useState("All");
    const [userTypes, setUserTypes] = useState([]);
  
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
  
    const [openDel, setOpenDel] = useState(false);
    const [delId, setDelId] = useState("");
    const handleClickOpenDel = (data) => {
      setDelId(data);
      setOpenDel(true);
    };
  
    const handleCloseDel = () => {
      setOpenDel(false);
    };
  
    useEffect(() => {
      if (currentUser != null) {
        axios
          .get(
           import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV +
              `/api/admin/fetchUsers`
          )
          .then((res) => {
            if (res.data === "failed") {
              console.error("Failed to fetch users");
            } else {
              const formattedData = res.data.map((item, i) => ({
                ...item,
                serial_no: i + 1,
              }));
  
              const uniqueUserTypes = [
                "All",
                ...new Set(
                  res.data
                    .map((item) => item.user_type || "Regular")
                    .filter((type) => type)
                ),
              ];
  
              setData(formattedData);
              setUserTypes(uniqueUserTypes);
              setDataLoaded(true);
            }
          })
          .catch((err) => {
            console.error("Error fetching users:", err);
            setDataLoaded(true);
          });
      }
    }, [change, currentUser]);
  
    // Filter data based on search and filter
    const filteredData = useMemo(() => {
      return data
          .filter((item) => {
              // First apply the user type filter
              if (filter === "All") {
                  return true;
              }
              return (item.user_type || "Regular") === filter;
          })
          .filter((item) => {
              // Then apply search filter
              if (!searchValue) return true;
              const normalizedSearch = searchValue.toLowerCase();
              return (
                  item.name?.toLowerCase().includes(normalizedSearch) ||
                  item.email?.toLowerCase().includes(normalizedSearch) ||
                  item.phone?.includes(searchValue) ||
                  item.id?.toString().includes(searchValue)
              );
          });
  }, [data, filter, searchValue]);
  
  // Add counts computation
  const userCounts = useMemo(() => {
      return {
          totalCount: data.length,
          activeCount: data.filter(item => item.status === 'active').length,
          inactiveCount: data.filter(item => item.status === 'inactive').length
      };
  }, [data]);
  
    const nPages = Math.ceil(filteredData.length / recordsPerPage);
  
    // Sorting state
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
  
    // Sort data function
    const sortData = (data, field, direction) => {
      if (!field) return data;
      
      return [...data].sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        // Handle special cases
        if (field === 'created_at' || field === 'updated_at' || field === 'last_login') {
          aValue = DateFormat(aValue);
          bValue = DateFormat(bValue);
        }
        
        // Convert to string for comparison
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        
        if (direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    };
  
    const sortedData = sortData(filteredData, sortField, sortDirection);
    const records = sortedData.slice(firstIndex, lastIndex);
  
    const theadArray = [
      { 
        value: "ID", 
        customClass: "div-table-cell-flex-0-3",
        sortable: true, 
        field: 'id',
        currentSort: sortField === 'id' ? sortDirection : null
      },
      { 
        value: "User Details",
        sortable: false
      },
      { 
        value: "User Type", 
        customClass: "mobile-hidden-field",
        sortable: true,
        field: 'user_type',
        currentSort: sortField === 'user_type' ? sortDirection : null
      },
    //   { 
    //     value: "Status", 
    //     customClass: "mobile-hidden-field",
    //     sortable: true,
    //     field: 'status',
    //     currentSort: sortField === 'status' ? sortDirection : null
    //   },
      { 
        value: "Created On", 
        customClass: "div-table-cell-date",
        sortable: true,
        field: 'created_at',
        currentSort: sortField === 'created_at' ? sortDirection : null
      },
    //   { 
    //     value: "Last Updated", 
    //     customClass: "div-table-cell-date",
    //     sortable: true,
    //     field: 'updated_at',
    //     currentSort: sortField === 'updated_at' ? sortDirection : null
    //   },
      { 
        value: "Last Login", 
        customClass: "div-table-cell-date",
        sortable: true,
        field: 'last_login',
        currentSort: sortField === 'last_login' ? sortDirection : null
      },
      { 
        value: "Actions", 
        customClass: "div-table-cell-action-btn",
        sortable: false
      },
    ];
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setOpenDropdownId(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    // Update the deleteUser function
    const deleteUser = async () => {
      try {
        setLoader(true);
        const response = await axios.delete(
          import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV + `/api/admin/deleteUser/${delId}`
        );
        
        if (response.data.success) {
          setChange(change + 1);
          setSnackDel(true);
          setOpenDel(false);
        } else {
          setSnackQ(true);
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        setSnackQ(true);
      } finally {
        setLoader(false);
      }
    };
  
    const handleAction = async (userId, action, to) => {
      setSelectedItem(action);
      setOpenDropdownId(null);
      try {
        switch (action) {
          case "View User":
            navigate(`${to}/${userId}`);
            break;
          case "Edit User":
            navigate(`${to}/${userId}`);
            break;
          case "Delete User":
            setDelId(userId);
            setOpenDel(true);
            break;
          default:
            console.warn(`Unknown action: ${action}`);
        }
      } catch (error) {
        console.error(`Error performing action ${action}:`, error);
        setSnackQ(true);
      }
  
      setTimeout(() => setSelectedItem(null), 300);
    };
  
    // Sorting function
    const handleSort = (field) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    };
  
    return (
      <div className="dashboard-main-wrapper">
        <DeleteDialog open={openDel} handleClose={handleCloseDel} deleteProperty={deleteUser} deleteHeading={"Delete this User?"} deleteContent={"Are you sure want to delete this user? You will not be able to recover it."} />
        
        <Snackbar
          ContentProps={{
            sx: {
              background: "green",
              color: "white",
            },
          }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={snackDel}
          autoHideDuration={1000}
          onClose={() => setSnackDel(false)}
          message={"User Deleted Successfully"}
        />
        
        {loader ? <Loader /> : ""}
        
        <Snackbar
          ContentProps={{
            sx: {
              background: "red",
              color: "white",
              textAlign: "center",
            },
          }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={snackQ}
          autoHideDuration={1000}
          onClose={() => setSnackQ(false)}
          message={"Operation Failed"}
        />
        
        <Snackbar
          ContentProps={{
            sx: {
              background: "green",
              color: "white",
              textAlign: "center",
            },
          }}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={snack}
          autoHideDuration={1000}
          onClose={() => setSnack(false)}
          message={"Operation Successful"}
        />
        
        <div className="dashboard-main-filters">
          <div className="row">
            <div className="col-md-3">
              <Filter
                filterOptions={userTypes}
                value={filter}
                onChange={(value) => {
                  setFilter(value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-md-9">
              <SearchBar
                value={searchValue}
                onChange={(value) => {
                  setSearchValue(value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
  
        <div className="div-table">
          <TableHead theadArray={theadArray} onSort={handleSort} />
          <div className="div-table-body">
            {!dataLoaded ? (
              <SkeletonTable count={recordsPerPage} />
            ) : records.length > 0 ? (
              records.map((item) => (
                <div className="div-table-row" key={item.id}>
                  <div className="div-table-cell div-table-cell-flex-0-3">{item.id}</div>
                  <div className="div-table-cell">
                    <div style={{ fontWeight: 600, color: "#222" }}>{item.name || "N/A"}</div>
                    <div><Link className="text-decoration-none" to={`mailto:${item.email}`} target="_blank">{item.email}</Link></div> 
                    <div><Link className="text-decoration-none" to={`https://api.whatsapp.com/send/?phone=${item.phone}`} target="_blank">{item.phone || "N/A"}</Link></div>
                  </div>
                  <div className="div-table-cell mobile-hidden-field">
                    {item.user_type || "-"}
                  </div>
                  {/* <div className="div-table-cell mobile-hidden-field">
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor: item.status === 'active' ? "#e6f4ea" : "#ffebee",
                      color: item.status === 'active' ? "#1e7e34" : "#c62828"
                    }}>
                      {item.status || "active"}
                    </span>
                  </div> */}
                  <div className="div-table-cell div-table-cell-date">
                    {item.created_at ? DateFormat(item.created_at) : "-"}
                  </div>
                  {/* <div className="div-table-cell div-table-cell-date">
                    {item.updated_at ? DateFormat(item.updated_at) : "-"}
                  </div> */}
                  <div className="div-table-cell div-table-cell-date">
                    {item.last_login ? DateFormat(item.last_login) : "-"}
                  </div>
  
                  <div
                    onClick={() =>
                      setOpenDropdownId(
                        openDropdownId === item.id ? null : item.id
                      )
                    }
                    className="div-table-cell div-table-cell-action-btn action-btn-wrapper"
                  >
                    <span className="action-btn">
                      Action{" "}
                      <span>
                        {openDropdownId === item.id ? (
                          <ArrowUp />
                        ) : (
                          <ArrowDown />
                        )}
                      </span>
                    </span>
                    {openDropdownId === item.id && (
                      <ActionBtnDropdown
                        userId={item.id}
                        selectedItem={selectedItem}
                        onAction={handleAction}
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="div-table-row-block">
                <div
                  className="div-table-cell"
                  style={{
                    gridColumn: "span 8",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  <NoData />
                </div>
              </div>
            )}
          </div>
          {records.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={nPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>
    );
  };
  
  export default AllUsers;
  