import {

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
    { title: "Edit", icon: <EditIcon /> },
    { title: "Delete", icon: <DeleteIcon /> },
  ];
  
  const ActionBtnDropdown = ({ mapId, selectedItem, onAction, open }) => (
    <div className={`action-dropdown css-1dhh8jv${open ? " action-dropdown-open" : ""}`}> 
      {ActionDropdownMenu.map((item) => (
        <div
          key={item.title}
          className={`action-dropdown-item ${selectedItem === item.title ? "selected-action" : ""}`}
          onClick={() => onAction(mapId, item.title)}
        >
          <span className="action-dropdown-icon">{item.icon}</span> {item.title}
        </div>
      ))}
    </div>
  );
  
  const ViewMaps = () => {
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
    const [filterCategory, setFilterCategory] = useState("All");
    const [categoryOptions, setCategoryOptions] = useState(["All"]);
  
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
              `/api/cityMap/fetchMapData`
          )
          .then((res) => {
            if (res.data === "failed") {
              console.error("Failed to fetch city maps");
            } else {
              const formattedData = res.data.map((item, i) => ({
                ...item,
                serial_no: i + 1,
              }));
  
              // Unique category options for filter
              setCategoryOptions([
                "All",
                ...Array.from(new Set(res.data.map((m) => m.map_category).filter(Boolean)))
              ]);
  
              setData(formattedData);
              setUserTypes(["All"]); // not used, but keep for compatibility
              setDataLoaded(true);
            }
          })
          .catch((err) => {
            console.error("Error fetching city maps:", err);
            setDataLoaded(true);
          });
      }
    }, [change, currentUser]);
  
    // Filter and search logic
    const filteredData = useMemo(() => {
      return data
        .filter((m) =>
          filterCategory === "All" ? true : m.map_category === filterCategory
        )
        .filter((m) => {
          if (!searchValue) return true;
          const val = searchValue.toLowerCase();
          return (
            m.map_city?.toLowerCase().includes(val) ||
            m.map_state?.toLowerCase().includes(val) ||
            m.map_category?.toLowerCase().includes(val) ||
            m.map_sub_category?.toLowerCase().includes(val) ||
            String(m.map_id).includes(val)
          );
        });
    }, [data, filterCategory, searchValue]);
  
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
      { value: "ID", customClass: "div-table-cell-flex-0-3", sortable: true, field: 'map_id', currentSort: sortField === 'map_id' ? sortDirection : null },
      { value: "City", sortable: true, field: 'map_city', currentSort: sortField === 'map_city' ? sortDirection : null },
      { value: "State", sortable: true, field: 'map_state', currentSort: sortField === 'map_state' ? sortDirection : null },
      { value: "Category", sortable: true, field: 'map_category', currentSort: sortField === 'map_category' ? sortDirection : null },
      { value: "Sub-category", sortable: true, field: 'map_sub_category', currentSort: sortField === 'map_sub_category' ? sortDirection : null },
      { value: "Image", sortable: false },
      { value: "Actions", customClass: "div-table-cell-action-btn", sortable: false },
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
  
    const handleAction = (mapId, action) => {
      setSelectedAction(action);
      setOpenDropdownId(null);
      if (action === "Edit") {
        navigate(`/edit-map?id=${mapId}`);
      } else if (action === "Delete") {
        setDelId(mapId);
        setOpenDel(true);
      }
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
        
        {/* Filter and Search UI */}
        <div className="dashboard-main-filters">
          <div className="row">
            <div className="col-md-3">
              <Filter
                filterOptions={categoryOptions}
                value={filterCategory}
                onChange={(value) => {
                  setFilterCategory(value);
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
            ) : filteredData.length > 0 ? (
              filteredData.slice(firstIndex, lastIndex).map((item) => (
                <div className="div-table-row" key={item.map_id}>
                  <div className="div-table-cell div-table-cell-flex-0-3">{item.map_id}</div>
                  <div className="div-table-cell">{item.map_city}</div>
                  <div className="div-table-cell">{item.map_state}</div>
                  <div className="div-table-cell">{item.map_category}</div>
                  <div className="div-table-cell">{item.map_sub_category}</div>
                  <div className="div-table-cell">
                    <img src={item.map_image} alt="" style={{ width: 80, borderRadius: 4 }} />
                  </div>
                  <div className="div-table-cell div-table-cell-action-btn action-btn-wrapper">
                    <span
                      className="action-btn"
                      onClick={() => setOpenDropdownId(openDropdownId === item.map_id ? null : item.map_id)}
                      style={{ cursor: "pointer" }}
                    >
                      Action {openDropdownId === item.map_id ? <ArrowUp /> : <ArrowDown />}
                    </span>
                    {openDropdownId === item.map_id && (
                      <ActionBtnDropdown
                        mapId={item.map_id}
                        selectedItem={selectedAction}
                        onAction={handleAction}
                        open={openDropdownId === item.map_id}
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
                    gridColumn: "span 7",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  <NoData />
                </div>
              </div>
            )}
          </div>
          {filteredData.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredData.length / recordsPerPage)}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>
    );
  };
  
  export default ViewMaps;
  