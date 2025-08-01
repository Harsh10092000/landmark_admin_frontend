import React, { useState, useEffect, useRef, useContext } from 'react';
import { LoadScript } from "@react-google-maps/api";
import { Autocomplete } from "@react-google-maps/api";
import axios from 'axios';  
import { useParams, useNavigate } from 'react-router-dom';
// Import Modal from MUI at the top
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';

import { IconCircleCheck, IconCircleCheckFilled } from '@tabler/icons-react';
import NoData from '../../components/Table/NoData';
import { AuthContext } from '../../context2/AuthContext';
import SessionOutLoginAgain from '../../components/Table/SessionOutLoginAgain';
import Loading from '../../components/Loading';

const MyProperty = () => {
    const { currentUser } = useContext(AuthContext);
    const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;
    const libraries = ["places"];
    const { propertyId } = useParams();

    // Show SessionOutLoginAgain if no user session
    if (!currentUser) {
        return (
            <div style={{
                boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.1)",
                border: "1px solid #dee2e6",
                borderRadius: "13px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "70vh"
            }}>
                <SessionOutLoginAgain />
            </div>
        );
    }

    // Show NoData if no propertyId
    if (propertyId == null) {
        return (
            <div style={{
                boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.1)",
                border: "1px solid #dee2e6",
                borderRadius: "13px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "70vh"
            }}>
                <NoData />
            </div>
        );
    }

    const [activeTab, setActiveTab] = useState('Basic Details');
    const [formSubmit, setFormSubmit] = useState(false);
    const [formData, setFormData] = useState({
        adType: '',
        userType: '',
        propertyType: '',
        propertySubType: '',
        plotNumber: '',
        state: '',
        city: '',
        subDistrict: '',
        locality: '',
        completeAddress: '',
        coverImage: '',
        otherImages: [],
        ownership: '',
        authority: '',
        otherRooms: [],
        facilities: [],
        amount: '',
        negotiable: false,
        rented: false,
        corner: false,
        desc: '',
        age: '',
        possession: '',
        furnishing: '',
        floor: 0,
        openSides: 0,
        parking: 0,
    });

    const tabs = [
        {
            label: 'Basic Details',
            isSelected: activeTab === 'Basic Details',
            length: null,
        },
        {
            label: 'Location Details',
            isSelected: activeTab === 'Location Details',
            length: null,
        },
        {
            label: 'Property Details',
            isSelected: activeTab === 'Property Details',
            length: null,
        },
        {
            label: 'Property Images',
            isSelected: activeTab === 'Property Images',
            length: null,
        },
        {
            label: 'Pricing & Others',
            isSelected: activeTab === 'Pricing & Others',
            length: null,
        },
    ];

    const handleTabClick = (label) => {
        setActiveTab(label);
        let ref = null;
        if (label === 'Basic Details') ref = basicDetailsRef;
        else if (label === 'Location Details') ref = locationDetailsRef;
        else if (label === 'Property Details') ref = propertyDetailsRef;
        else if (label === 'Property Images') ref = propertyImagesRef;
        else if (label === 'Pricing & Others') ref = pricingOthersRef;
        if (ref && ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };


    const adTypes = [
        { label: "Sale", icon: "🟢" },
        { label: "Rent", icon: "🔴" },
    ];
    const userTypes = [
        { label: "Broker", icon: "🧑‍💼" },
        { label: "Owner", icon: "👤" },
    ];
    const proTypes = [
        { value: "Residential", icon: "🏠" },
        { value: "Land", icon: "🌱" },
        { value: "Commercial", icon: "🏢" },
    ];
    const proResSubTypes = [
        { value: "Apartment,Residential", item: "Apartment" },
        { value: "Independent House,Residential", item: "Independent House" },
        { value: "Builder Floor,Residential", item: "Builder Floor" },
        { value: "Farm House,Residential", item: "Farm House" },
        { value: "Raw House,Residential", item: "Raw House" },
        { value: "Retirement Community,Residential", item: "Retirement Community" },
        { value: "Studio Apartment,Residential", item: "Studio Apartment" },
        { value: "RK,Residential", item: "RK" },
    ];
    const proLandSubTypes = [
        { value: "Residential Land,Land", item: "Residential Land" },
        { value: "Commercial Land,Land", item: "Commercial Land" },
        { value: "Industrial Land,Land", item: "Industrial Land" },
        { value: "Agricultural Land,Land", item: "Agricultural Land" },
        { value: "Farm House Land,Land", item: "Farm House Land" },
        { value: "Institutional Land,Land", item: "Institutional Land" },
    ];
    const proCommercialSubTypes = [
        { value: "Retail Showroom,Commercial", item: "Retail Showroom" },
        { value: "Commercial Building,Commercial", item: "Commercial Building" },
        { value: "Office Complex,Commercial", item: "Office Complex" },
        { value: "Software Technology Park,Commercial", item: "Software Technology Park" },
        { value: "Warehouse,Commercial", item: "Warehouse" },
        { value: "Industrial Estate,Commercial", item: "Industrial Estate" },
        { value: "Institutional Building,Commercial", item: "Institutional Building" },
        { value: "Petrol Pump,Commercial", item: "Petrol Pump" },
        { value: "Cold Store,Commercial", item: "Cold Store" },
    ];

    let subTypes = [];
    if (formData.propertyType === "Residential") subTypes = proResSubTypes;
    else if (formData.propertyType === "Land") subTypes = proLandSubTypes;
    else if (formData.propertyType === "Commercial") subTypes = proCommercialSubTypes;

    // Add location state at the top with other states
    const [location, setLocation] = useState("");
    const autocompleteRef = useRef(null);
    const [showManualFields, setShowManualFields] = useState(false);
    const [change, setChange] = useState(false);
    // Update onLoad function
    const onLoad = (autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    // Update onPlaceChanged function
    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place && place.address_components) {
                // Reset fields first
                let newFormData = {
                    ...formData,
                    plotNumber: "",
                    state: "",
                    city: "",
                    subDistrict: "",
                    locality: "",
                    completeAddress: "",
                    pinCode: ""
                };

                // Map address components to fields
                place.address_components.forEach((component) => {
                    const types = component.types;

                    // Plot Number / Street Number
                    if (types.includes('street_number')) {
                        newFormData.plotNumber = component.long_name;
                    }
                    // Street Name
                    else if (types.includes('route')) {
                        newFormData.plotNumber = newFormData.plotNumber 
                            ? `${newFormData.plotNumber}, ${component.long_name}`
                            : component.long_name;
                    }
                    // State
                    else if (types.includes('administrative_area_level_1')) {
                        newFormData.state = component.long_name;
                    }
                    // City
                    else if (types.includes('locality')) {
                        newFormData.city = component.long_name;
                    }
                    // Sub District
                    else if (types.includes('administrative_area_level_2')) {
                        newFormData.subDistrict = component.long_name;
                    }
                    // Locality/Area
                    else if (types.includes('sublocality_level_1')) {
                        newFormData.locality = component.long_name;
                    }
                    // Pin Code
                    else if (types.includes('postal_code')) {
                        newFormData.pinCode = component.long_name;
                    }
                });

                // Set complete address
                newFormData.completeAddress = place.formatted_address || "";

                // If locality is not set but we have sublocality_level_2, use that
                if (!newFormData.locality) {
                    const sublocalityLevel2 = place.address_components.find(
                        component => component.types.includes('sublocality_level_2')
                    );
                    if (sublocalityLevel2) {
                        newFormData.locality = sublocalityLevel2.long_name;
                    }
                }

                // If city is not set but we have administrative_area_level_3, use that
                if (!newFormData.city) {
                    const adminArea3 = place.address_components.find(
                        component => component.types.includes('administrative_area_level_3')
                    );
                    if (adminArea3) {
                        newFormData.city = adminArea3.long_name;
                    }
                }

                // Update form data
                setFormData(newFormData);

                // Update location field
                setLocation(place.formatted_address || "");

                console.log("Place selected:", place);
                console.log("Updated form data:", newFormData);
            }
        }
    };

    const basicDetailsRef = useRef(null);
    const locationDetailsRef = useRef(null);
    const propertyDetailsRef = useRef(null);
    const propertyImagesRef = useRef(null);
    const pricingOthersRef = useRef(null);

    const sectionRefs = [
        { label: 'Basic Details', ref: basicDetailsRef },
        { label: 'Location Details', ref: locationDetailsRef },
        { label: 'Property Details', ref: propertyDetailsRef },
        { label: 'Property Images', ref: propertyImagesRef },
        { label: 'Pricing & Others', ref: pricingOthersRef },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 120; // 120 = offset for sticky header, adjust as needed
            let currentSection = 'Basic Details';
            for (let i = 0; i < sectionRefs.length; i++) {
                const section = sectionRefs[i].ref.current;
                if (section) {
                    const { top } = section.getBoundingClientRect();
                    if (top + window.scrollY - 130 <= scrollPosition) { // 130 = offset, adjust as needed
                        currentSection = sectionRefs[i].label;
                    }
                }
            }
            setActiveTab(currentSection);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    useEffect(() => {
        if (propertyId != null) {
          axios
            .get(
               import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV +
                `/api/listing/getPropertyById/${propertyId}`
            )
            .then((res) => {
                console.log("res.data : ", res.data[0]);
              if (res.data === "failed") {
                // Handle failed response without clearUser
                console.error("Failed to fetch property data");
              } else {
                const propertyData = res.data[0];
                
                // Create new form data object instead of mutating
                const newFormData = {
                  adType: propertyData.pro_ad_type || '',
                  propertyType: propertyData.pro_type || '',
                  propertySubType: propertyData.pro_sub_cat || '',
                  plotNumber: propertyData.pro_plot_no || '',
                  state: propertyData.pro_state || '',
                  city: propertyData.pro_city || '',
                  subDistrict: propertyData.pro_sub_district || '',
                  locality: propertyData.pro_locality || '',
                  completeAddress: propertyData.pro_street || '',
                  pinCode: propertyData.pro_pincode || '',
                  coverImage: propertyData.pro_cover_image || '',
                  otherImages: propertyData.pro_other_images ? JSON.parse(propertyData.pro_other_images) : [],
                  ownership: propertyData.pro_ownership_type || '',
                  authority: propertyData.pro_user_type || '',
                  plotSize: propertyData.pro_area_size || '',
                  plotSizeUnit: propertyData.pro_area_size_unit || 'Marla',
                  roadWidth: propertyData.pro_facing_road_width || '',
                  roadWidthUnit: propertyData.pro_facing_road_unit || 'Feet',
                  plotWidth: propertyData.pro_width || '',
                  plotLength: propertyData.pro_length || '',
                  bedrooms: propertyData.pro_bedroom || '',
                  washrooms: propertyData.pro_washrooms || '',
                  balconies: propertyData.pro_balcony || '',
                  facing: propertyData.pro_facing || '',
                  amount: propertyData.pro_amt || '',
                  negotiable: propertyData.pro_negotiable === "Yes",
                  rented: propertyData.pro_rental_status === "Yes",
                  corner: propertyData.pro_corner === "Yes",
                  desc: propertyData.pro_desc || '',
                  otherRooms: propertyData.pro_other_rooms ? JSON.parse(propertyData.pro_other_rooms) : [],
                  facilities: propertyData.pro_near_by_facilities ? JSON.parse(propertyData.pro_near_by_facilities) : [],
                  authority: propertyData.pro_approval || '',
                  age: propertyData.pro_age || '',
                  possession: propertyData.pro_possession || '',
                  furnishing: propertyData.pro_furnishing || '',
                  floor: propertyData.pro_floor || 0,
                  openSides: propertyData.pro_open_sides || 0,
                  parking: propertyData.pro_parking || 0,
                };
                
                setFormData(newFormData);
              }
            })
            .catch((err) => {
              console.error("Error fetching property data:", err);
            });
        }
      }, [propertyId]); // Remove 'change' from dependencies

      console.log("formData : ", formData);

    const MAX_OTHER_IMAGES = 10;
    const MAX_SIZE = 1000000; // 1MB
    const MIN_SIZE = 10000;   // 10KB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    // Simplify price format function
    const priceFormat = (val) => {
        if (!val) return "e.g. ₹ 10,00,000";
        let num = parseInt(val.toString().replace(/[^0-9]/g, ""));
        if (!num) return "e.g. ₹ 10,00,000";
        
        // Format in Indian currency style
        const formatted = num.toLocaleString('en-IN');
        
        // Add denomination
        let denomination = '';
        if (num >= 10000000) {
            denomination = ` (${(num / 10000000).toFixed(2)} Crore)`;
        } else if (num >= 100000) {
            denomination = ` (${(num / 100000).toFixed(2)} Lac)`;
        } else if (num >= 1000) {
            denomination = ` (${(num / 1000).toFixed(2)} Thousand)`;
        }
        
        return `₹ ${formatted}${denomination}`;
    };

    // Add this helper function at the top with other constants
    const validateImage = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return "Invalid format (only JPG, PNG, WEBP)";
        }
        if (file.size > MAX_SIZE) {
            return "File too large (max 1MB)";
        }
        if (file.size < MIN_SIZE) {
            return "File too small (min 10KB)";
        }
        return "";
    };

    const navigate = useNavigate();

    // Add state for popup at the top with other states
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // Replace the SuccessPopup component with this new Modal component
    const SuccessModal = ({ open, onClose }) => {
        return (
            <>
                {open && (
                    <div className="modal-backdrop">
                        <div className="modern-modal">
                            {/* Icon above title */}
                            <div className="modal-icon">
                                <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="12" fill="#f0fff4" />
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#38a169" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="modal-content">
                                <h2 className="modal-title">Success!</h2>
                                <div className="modal-subtext">Property has been updated successfully</div>
                                <button className="modal-btn" onClick={onClose}>
                                    CONTINUE
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <style jsx>{`
                    .modal-backdrop {
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0,0,0,0.18);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        animation: fadeIn 0.25s;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .modern-modal {
                        background: linear-gradient(135deg, #fff 80%, #f0fff4 100%);
                        border-radius: 22px;
                        box-shadow: 0 12px 48px 0 rgba(56,161,105,0.15), 0 1.5px 8px 0 rgba(56,161,105,0.08);
                        min-width: 340px;
                        max-width: 420px;
                        width: 100%;
                        padding: 2.7rem 2.7rem 2.2rem 2.7rem;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        animation: modalPop 0.18s cubic-bezier(.4,2,.6,1) both;
                    }
                    @keyframes modalPop {
                        0% { transform: scale(0.95); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .modal-icon {
                        margin-bottom: 0.7rem;
                        margin-top: -0.5rem;
                    }
                    .modal-title {
                        font-size: 15px;
                        font-weight: 800;
                        color: #222;
                        margin-bottom: 0.7rem;
                        text-align: center;
                    }
                    .modal-subtext {
                        color: #666;
                        font-size: 13px;
                        margin-bottom: 2.1rem;
                        text-align: center;
                    }
                    .modal-btn {
                        width: 100%;
                        background: #38a169;
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        padding: 13px 0;
                        font-size: 11.3px;
                        font-weight: 700;
                        letter-spacing: 1px;
                        margin-top: .5rem;
                        cursor: pointer;
                        transition: background 0.18s;
                    }
                    .modal-btn:hover {
                        background: #2f855a;
                    }
                `}</style>
            </>
        );
    };

    // Update handleSubmit function with proper validation
    const handleSubmit = async () => {
        try {
                setFormSubmit(true);
            
            // Basic Details Validation
            if (!formData.adType) {
                alert("Ad Type is required");
                return;
            }
            if (!formData.propertyType) {
                alert("Property Type is required");
                return;
            }
            if (!formData.propertySubType) {
                alert("Property Sub Type is required");
                return;
            }

            // Location Details Validation
            if (!formData.plotNumber) {
                alert("Plot Number is required");
                return;
            }
            if (!formData.state) {
                alert("State is required");
                return;
            }
            if (!formData.city) {
                alert("City is required");
                return;
            }
            if (!formData.subDistrict) {
                alert("Sub District is required");
                return;
            }
            if (!formData.locality) {
                alert("Locality is required");
                return;
            }
            if (!formData.completeAddress) {
                alert("Complete Address is required");
                return;
            }
            if (!formData.pinCode) {
                alert("Pin Code is required");
                return;
            }
            if (!PINCODE_PATTERN.test(formData.pinCode)) {
                alert("Pin Code must be a valid 6-digit number");
                return;
            }

            // Property Details Validation
            if (!formData.plotSize) {
                alert("Plot Size is required");
                return;
            }
            if (!formData.plotSizeUnit) {
                alert("Plot Size Unit is required");
                return;
            }

            // Amount Validation
            if (!formData.amount) {
                alert("Expected Amount is required");
                return;
            }

            // Create FormData for image upload
            const imageFormData = new FormData();
            
            let fileIndex = 0;
            
            // Handle cover image
            if (formData.coverImage && typeof formData.coverImage === 'object' && formData.coverImage.file) {
                imageFormData.append(`file${fileIndex}`, formData.coverImage.file);
                fileIndex++;
            }
            
            // Handle other images
            if (formData.otherImages && formData.otherImages.length > 0) {
                const otherImages = Array.isArray(formData.otherImages) 
                    ? formData.otherImages 
                    : JSON.parse(formData.otherImages);
                
                otherImages.forEach((img, index) => {
                    if (typeof img === 'object' && img.file) {
                        imageFormData.append(`file${fileIndex}`, img.file);
                        fileIndex++;
              }
            });
        }

            // Upload images first if there are any new images
            let uploadedImages = {
                coverImage: typeof formData.coverImage === 'string' ? formData.coverImage : null,
                otherImages: []
            };

            const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || 'https://landmarkplots.com';

            if (fileIndex > 0) {
                    const uploadRes = await axios.post(
                        MAIN_SITE_URL + '/api/property/upload-image',
                        imageFormData,
                        { headers: { 'Content-Type': 'multipart/form-data' } }
                    );
                
                if (uploadRes.data.success && uploadRes.data.filenames) {
                    const filenames = uploadRes.data.filenames;
                    
                    // Separate cover image and other images
                    // First file is cover image (if cover was uploaded), rest are other images
                    const hasCoverImage = formData.coverImage && typeof formData.coverImage === 'object' && formData.coverImage.file;
                    
                    if (hasCoverImage && filenames.length > 0) {
                        uploadedImages.coverImage = filenames[0];
                        uploadedImages.otherImages = filenames.slice(1);
                    } else {
                        uploadedImages.otherImages = filenames;
                    }
                }
            }

            // Prepare final form data
            const finalData = {
                ...formData,
                coverImage: uploadedImages.coverImage || formData.coverImage,
                otherImages: uploadedImages.otherImages.length > 0 
                    ? uploadedImages.otherImages 
                    : (Array.isArray(formData.otherImages) 
                        ? formData.otherImages.map(img => typeof img === 'string' ? img : img.uploadedName)
                        : JSON.parse(formData.otherImages || '[]')),
                pro_negotiable: formData.negotiable ? "Yes" : "No",
                pro_rental_status: formData.rented ? "Yes" : "No",
                pro_corner: formData.corner ? "Yes" : "No"
            };

            // Submit the form
            
            const response = await axios.put(
               import.meta.env.NODE_ENV === 'development' ? import.meta.env.VITE_BACKEND_DEV + `/api/listing/updateProperty/${propertyId}` : import.meta.env.VITE_BACKEND_PROD + `/api/listing/updateProperty/${propertyId}`,
                finalData
            );

            if (response.data.success) {
                setFormSubmit(false);
                setShowSuccessPopup(true);
            } else {
                setFormSubmit(false);
                alert("Failed to update property. Please try again.");
            }
        } catch (error) {
            console.error("Error updating property:", error);
            alert("An error occurred while updating the property.");
        }
    };

    return (
        <>
        {formSubmit && <Loading />}
            <LoadScript
                googleMapsApiKey="AIzaSyDLzo_eOh509ONfCjn1XQp0ZM2pacPdnWc"
                libraries={libraries}
            >
                <div className='dashboard-main-wrapper'>
                    <div className="tab_section_wrapper">
                        <div className="tab_section">
                            {tabs.map((tab) => (
                                <div
                                    key={tab.label}
                                    onClick={() => handleTabClick(tab.label)}
                                    className={`tab_section-item ${tab.isSelected ? 'tab_section-item-selected' : ''}`}
                                >
                                    {tab.label}
                                    {tab.length !== null && (
                                        <span className="tab-section-length">{tab.length}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='main-wrapper'>
                    <div ref={basicDetailsRef} className='row myproperty-section'>
                        {/* Minimal, modern Basic Details heading using class only */}
                        <div className="myproperty-section-title-minimal">Basic Details</div>
                        <div className="col-md-12 inside-section-wrapper">
                            <label className="myproperty-label">Ad Type <span style={{ color: '#ec161e' }}>*</span></label>
                            <div className="myproperty-pill-group">
                                {adTypes.map((type) => (
                                    <button
                                        key={type.label}
                                        className={`myproperty-pill${formData.adType === type.label ? " selected" : ""}`}
                                        onClick={() => setFormData({ ...formData, adType: type.label })}
                                        type="button"
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                            {formSubmit && !formData.adType && <div className="myproperty-error-msg">Ad Type is required</div>}
                        </div>
                        <div className=" col-md-12 inside-section-wrapper">
                            <label className="myproperty-label">Property Type <span style={{ color: '#ec161e' }}>*</span></label>
                            <div className="myproperty-pill-group">
                                {proTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        className={`myproperty-pill${formData.propertyType === type.value ? " selected" : ""}`}
                                        onClick={() => {
                                            setFormData({ ...formData, propertyType: type.value, propertySubType: "" });
                                        }}
                                        type="button"
                                    >
                                        {type.value}
                                    </button>
                                ))}
                            </div>
                            {formSubmit && !formData.propertyType && <div className="myproperty-error-msg">Property Type is required</div>}
                        </div>
                        <div className=" col-md-12 inside-section-wrapper">
                            <label className="myproperty-label">Property Sub Type <span style={{ color: '#ec161e' }}>*</span></label>
                            <div className="myproperty-pill-group myproperty-pill-group-wrap">
                                {subTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        className={`myproperty-pill${formData.propertySubType === type.value ? " selected" : ""}`}
                                        onClick={() => setFormData({ ...formData, propertySubType: type.value })}
                                        type="button"
                                    >
                                        {type.item}
                                    </button>
                                ))}
                            </div>
                            {formSubmit && !formData.propertySubType && <div className="myproperty-error-msg">Property Sub Type is required</div>}
                        </div>
                    </div>

                    <div ref={locationDetailsRef} className='row myproperty-section'>
                        <div className="myproperty-section-title-minimal">Location Details</div>
                        <div className="col-md-12 inside-section-wrapper">
                            <label className="myproperty-label">
                                Location Details <span style={{ color: '#ec161e' }}>*</span>
                            </label>
                            <div className="location-input-group">
                                <Autocomplete
                                    onLoad={onLoad}
                                    onPlaceChanged={onPlaceChanged}
                                    options={{
                                        types: ["geocode"],
                                        componentRestrictions: { country: "in" }
                                    }}
                                >
                                    <input
                                        type="text"
                                        className="myproperty-location-input"
                                        placeholder="Enter location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </Autocomplete>
                                <div className="myproperty-location-divider">
                                    <span>Or</span>
                                </div>
                            </div>
                        </div>
                        <div className="auto-filled-fields">
                            <div className="myproperty-location-autofill-row">
                                <div style={{flex:1}} className='col-md-4'>
                                    <label className="myproperty-label">Plot Number <span style={{ color: '#ec161e' }}>*</span></label>
                                    <input
                                        type="text"
                                        className="myproperty-location-input"
                                        placeholder="Plot Number"
                                        value={formData.plotNumber}
                                        onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })}
                                    />
                                    {formSubmit && !formData.plotNumber && <div className="myproperty-location-error">Plot Number is required</div>}
                                </div>
                                <div style={{flex:1}} className='col-md-4'>
                                    <label className="myproperty-label">State</label>
                                    <input
                                        type="text"
                                        className="myproperty-location-input"
                                        placeholder="State"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    />
                                    {formSubmit && !formData.state && <div className="myproperty-location-error">State is required</div>}
                                </div>
                                <div style={{flex:1}} className='col-md-4'>
                                    <label className="myproperty-label">City</label>
                                    <input
                                        type="text"
                                        className="myproperty-location-input"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                    {formSubmit && !formData.city && <div className="myproperty-location-error">City is required</div>}
                                </div>
                            </div>
                            <div className="myproperty-location-autofill-row">
                                <div style={{flex:1}} className='col-md-4'>
                                    <label className="myproperty-label">Sub District</label>
                                    <input
                                        type="text"
                                        className="myproperty-location-input"
                                        placeholder="Sub District"
                                        value={formData.subDistrict}
                                        onChange={(e) => setFormData({ ...formData, subDistrict: e.target.value })}
                                    />
                                    {formSubmit && !formData.subDistrict && <div className="myproperty-location-error">Sub District is required</div>}
                                </div>
                                <div style={{flex:1}} className='col-md-4'>
                                    <label className="myproperty-label">Locality</label>
                                    <input
                                        type="text"
                                        className="myproperty-location-input"
                                        placeholder="Locality"
                                        value={formData.locality}
                                        onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                                    />
                                    {formSubmit && !formData.locality && <div className="myproperty-location-error">Locality is required</div>}
                                </div>
                                <div style={{flex:1}} className='col-md-4'>
                                    <label className="myproperty-label">Complete Address</label>
                                    <input
                                        type="text"
                                        className="myproperty-location-input"
                                        placeholder="Complete Address"
                                        value={formData.completeAddress}
                                        onChange={(e) => setFormData({ ...formData, completeAddress: e.target.value })}
                                    />
                                    {formSubmit && !formData.completeAddress && <div className="myproperty-location-error">Complete Address is required</div>}
                                </div>
                            </div>
                            <div className="myproperty-location-autofill-row">
                                <div style={{flex:1}} className='col-md-4'>
                                    <label className="myproperty-label">Pin Code</label>
                                    <input
                                        type="text"
                                        className="myproperty-location-input"
                                        placeholder="Pin Code"
                                        value={formData.pinCode}
                                        onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                                        maxLength={6}
                                    />
                                    {formSubmit && !formData.pinCode && <div className="myproperty-location-error">Pin Code is required</div>}
                                    {formSubmit && formData.pinCode && !PINCODE_PATTERN.test(formData.pinCode) && <div className="myproperty-location-error">Pin Code must be a valid 6-digit number</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div ref={propertyDetailsRef} className='row myproperty-section'>
                        <div className="myproperty-section-title-minimal">Property Details</div>
                      
                            {/* Plot & Road Details */}
                            <div className="row">
                                <div className="col-md-4 inside-section-wrapper" >
                                    <label className="myproperty-label">Area Plot Size <span style={{ color: '#ec161e' }}>*</span></label>
                                    <input
                                        className="myproperty-location-input"
                                        placeholder="Area Plot Size"
                                        value={formData.plotSize || ''}
                                        onChange={e => setFormData({ ...formData, plotSize: e.target.value })}
                                    />
                                    {formSubmit && !formData.plotSize && <div className="myproperty-error-msg">Plot Size is required</div>}
                                </div>
                                <div className="col-md-2 inside-section-wrapper">
                                    <label className="myproperty-label">Unit</label>
                                    <select
                                        className="myproperty-location-input"
                                        value={formData.plotSizeUnit || 'Marla'}
                                        onChange={e => setFormData({ ...formData, plotSizeUnit: e.target.value })}
                                    >
                                        <option>Marla</option>
                                        <option>Sq. Yards</option>
                                        <option>Sq. Meters</option>
                                        <option>Sq. Feet</option>
                                    </select>
                                </div>
                                <div className="col-md-4 inside-section-wrapper">
                                    <label className="myproperty-label">Facing Road Width</label>
                                    <input
                                        className="myproperty-location-input"
                                        placeholder="Facing road Width"
                                        value={formData.roadWidth || ''}
                                        onChange={e => setFormData({ ...formData, roadWidth: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-2 inside-section-wrapper">
                                    <label className="myproperty-label">Unit</label>
                                    <select
                                        className="myproperty-location-input"
                                        value={formData.roadWidthUnit || 'Feet'}
                                        onChange={e => setFormData({ ...formData, roadWidthUnit: e.target.value })}
                                    >
                                        <option>Feet</option>
                                        <option>Meters</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="myproperty-label">Plot Width (in Feet)</label>
                                    <input
                                        className="myproperty-location-input"
                                        placeholder="Plot Width (in Feet)"
                                        value={formData.plotWidth || ''}
                                        onChange={e => setFormData({ ...formData, plotWidth: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6 inside-section-wrapper">
                                    <label className="myproperty-label">Plot Length (in Feet)</label>
                                    <input
                                        className="myproperty-location-input"
                                        placeholder="Plot Length (in Feet)"
                                        value={formData.plotLength || ''}
                                        onChange={e => setFormData({ ...formData, plotLength: e.target.value })}
                                    />
                                </div>
                            </div>
                            {/* Pill Groups */}
                            <div className="row">
                            
                                            {(formData.propertyType !== "Land") &&
                                            <>
                                <div className="col-md-12 inside-section-wrapper">
                                    <label className="myproperty-label">Age of Property (in year)</label>
                                    <div className="myproperty-pill-group">
                                        {['0','0-1','1-3','3-5','5-10','10+'].map(val => (
                                            <button
                                                key={val}
                                                className={`myproperty-pill${formData.age === val ? ' selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, age: val })}
                                                type="button"
                                            >{val}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-md-6 inside-section-wrapper">
                                    <label className="myproperty-label">Number of Bedrooms</label>
                                    <div className="myproperty-pill-group">
                                        {['0','1','2','3','4','5+'].map(val => (
                                            <button
                                                key={val}
                                                className={`myproperty-pill${formData.bedrooms === val ? ' selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, bedrooms: val })}
                                                type="button"
                                            >{val}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-md-6 inside-section-wrapper">
                                    <label className="myproperty-label">Number of Washrooms</label>
                                    <div className="myproperty-pill-group">
                                        {['0','1','2','3','4','5+'].map(val => (
                                            <button
                                                key={val}
                                                className={`myproperty-pill${formData.washrooms === val ? ' selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, washrooms: val })}
                                                type="button"
                                            >{val}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-md-6 inside-section-wrapper">
                                    <label className="myproperty-label">Number of Balconies</label>
                                    <div className="myproperty-pill-group">
                                        {['0','1','2','3','4','5+'].map(val => (
                                            <button
                                                key={val}
                                                className={`myproperty-pill${formData.balconies === val ? ' selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, balconies: val })}
                                                type="button"
                                            >{val}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-md-6 inside-section-wrapper">
                                    <label className="myproperty-label">Car Parking</label>
                                    <div className="myproperty-pill-group">
                                        {['0','1','2','3','4','5+'].map(val => (
                                            <button
                                                key={val}
                                                className={`myproperty-pill${formData.parking === val ? ' selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, parking: val })}
                                                type="button"
                                            >{val}</button>
                                        ))}
                                    </div>
                                </div>
                                </>
                                             }
                                <div className="col-md-12 inside-section-wrapper">
                                    <label className="myproperty-label">Property Facing</label>
                                    <div className="myproperty-pill-group">
                                        {['North','North-East','East','South-East','South','South-West','West','North-West'].map(val => (
                                            <button
                                                key={val}
                                                className={`myproperty-pill${formData.facing === val ? ' selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, facing: val })}
                                                type="button"
                                            >{val}</button>
                                        ))}
                                    </div>
                                </div>
                                {(formData.propertyType !== "Land") &&
                                           
                                <div className="col-md-12 inside-section-wrapper">
                                    <label className="myproperty-label">Furnishing</label>
                                    <div className="myproperty-pill-group">
                                        {['Fully Furnished','Semi Furnished','Unfurnished'].map(val => (
                                            <button
                                                key={val}
                                                className={`myproperty-pill${formData.furnishing === val ? ' selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, furnishing: val })}
                                                type="button"
                                            >{val}</button>
                                        ))}
                                    </div>
                                </div>
}
                                <div className="col-md-12 inside-section-wrapper">
                                    <label className="myproperty-label">Possession Available</label>
                                    <div className="myproperty-pill-group">
                                        {['Immediate','0-3 Month','3-6 Month','After 6 Months'].map(val => (
                                            <button
                                                key={val}
                                                className={`myproperty-pill${formData.possession === val ? ' selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, possession: val })}
                                                type="button"
                                            >{val}</button>
                                        ))}
                                    </div>
                                </div>
                                 {(formData.propertyType !== "Land") &&
                                <div className="col-md-6 inside-section-wrapper">
                                    <label className="myproperty-label">Number of Floors</label>
                                    <div className="myproperty-pill-group">
                                        {['0','1','2','3','4','5+'].map(val => (
                                            <button
                                                key={val}
                                                className={`myproperty-pill${formData.floors === val ? ' selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, floors: val })}
                                                type="button"
                                            >{val}</button>
                                        ))}
                                    </div>
                                </div>
                                }

                                <div className="col-md-6 inside-section-wrapper">
                                    <label className="myproperty-label">Number of Open Sides</label>
                                    <div className="myproperty-pill-group">
                                        {['1','2','3','4'].map(val => (
                                            <button
                                                key={val}
                                                className={`myproperty-pill${formData.sides === val ? ' selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, sides: val })}
                                                type="button"
                                            >{val}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        
                    </div>

                    <div ref={propertyImagesRef} className='row myproperty-section'>
                        <div className="myproperty-section-title-minimal">Property Images</div>
                        <div className="col-md-12 inside-section-wrapper">
                            
                            <div className="row">
                                <div className="col-md-6 inside-section-wrapper">
                                <label className="myproperty-label">Cover Image <span style={{ color: '#ec161e' }}>*</span></label>
                                    <input
                                        type="file"
                                        className="myproperty-location-input"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={e => {
                                            if (e.target.files && e.target.files[0]) {
                                                const file = e.target.files[0];
                                                const error = validateImage(file);
                                                setFormData({ 
                                                    ...formData, 
                                                    coverImage: {
                                                        file,
                                                        error,
                                                        preview: URL.createObjectURL(file)
                                                    }
                                                });
                                            }
                                            e.target.value = "";
                                        }}
                                    />
                                    <div className="image-upload-note" style={{fontSize: '0.85em', color: '#666', marginTop: 4}}>
                                        (JPG, PNG, WEBP, 10KB - 1MB)
                                    </div>
                                    {formData.coverImage && (
                                        <div style={{marginTop: 8, position: 'relative', display: 'inline-block'}}>
                                            <img
                                                src={
                                                    typeof formData.coverImage === 'object' && formData.coverImage.file
                                                        ? URL.createObjectURL(formData.coverImage.file)
                                                        : `https://landmarkplots.com/uploads/${formData.coverImage}`
                                                }
                                                alt="cover"
                                                style={{ 
                                                    width: 120, 
                                                    height: 80, 
                                                    objectFit: 'cover', 
                                                    borderRadius: 6,
                                                    border: formData.coverImage.error ? '2px solid #ec161e' : 'none'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="myproperty-image-remove-btn"
                                                style={{ position: 'absolute', top: 4, right: 4 }}
                                                onClick={() => setFormData({ ...formData, coverImage: null })}
                                                title="Remove"
                                            >
                                                &times;
                                            </button>
                                            {formData.coverImage.error && (
                                                <div className="myproperty-error-msg" style={{marginTop: 4}}>
                                                    {formData.coverImage.error}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6 inside-section-wrapper">
                                    <label className="myproperty-label">Other Images</label>
                                    <input
                                        type="file"
                                        className="myproperty-location-input"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={e => {
                                            const files = Array.from(e.target.files);
                                            let currentImages = Array.isArray(formData.otherImages)
                                                ? formData.otherImages
                                                : JSON.parse(formData.otherImages || "[]");
                                            
                                            // Process all files, including those beyond limit
                                            const newImages = files.map(file => ({
                                                file,
                                                error: validateImage(file),
                                                preview: URL.createObjectURL(file),
                                                isOverLimit: (currentImages.length + files.length) > MAX_OTHER_IMAGES
                                            }));
                                            
                                            // Combine with existing images
                                            const combined = [...currentImages, ...newImages];
                                            
                                            // Mark images over limit
                                            combined.forEach((img, idx) => {
                                                if (idx >= MAX_OTHER_IMAGES) {
                                                    img.isOverLimit = true;
                                                    if (!img.error) {
                                                        img.error = `Exceeds maximum limit of ${MAX_OTHER_IMAGES} images`;
                                                    }
                                                }
                                            });
                                            
                                            setFormData({ ...formData, otherImages: combined });
                                            e.target.value = "";
                                        }}
                                    />
                                    <div className="image-upload-note" style={{fontSize: '0.85em', color: '#666', marginTop: 4}}>
                                        (JPG, PNG, WEBP, 10KB - 1MB, up to {MAX_OTHER_IMAGES} images)
                                    </div>
                                    {formData.otherImages && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                            {(Array.isArray(formData.otherImages)
                                                ? formData.otherImages
                                                : JSON.parse(formData.otherImages)
                                            ).map((img, idx) => (
                                                <div key={idx} style={{ position: 'relative' }}>
                                                    <img
                                                        src={
                                                            typeof img === 'object' && img.file
                                                                ? URL.createObjectURL(img.file)
                                                                : `https://landmarkplots.com/uploads/${img}`
                                                        }
                                                        alt={`other-${idx}`}
                                                        style={{ 
                                                            width: 90, 
                                                            height: 60, 
                                                            objectFit: 'cover', 
                                                            borderRadius: 6,
                                                            border: img.error || img.isOverLimit ? '2px solid #ec161e' : 'none',
                                                            opacity: img.isOverLimit ? 0.7 : 1
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="myproperty-image-remove-btn"
                                                        onClick={() => {
                                                            const currentImages = Array.isArray(formData.otherImages)
                                                                ? formData.otherImages
                                                                : JSON.parse(formData.otherImages || "[]");
                                                            
                                                            const newImages = currentImages.filter((_, i) => i !== idx);
                                                            
                                                            // Recalculate over-limit status
                                                            newImages.forEach((img, i) => {
                                                                if (i < MAX_OTHER_IMAGES) {
                                                                    if (typeof img === 'object') {
                                                                        img.isOverLimit = false;
                                                                        if (img.error === `Exceeds maximum limit of ${MAX_OTHER_IMAGES} images`) {
                                                                            img.error = '';
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                            
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                otherImages: newImages
                                                            }));
                                                        }}
                                                        title="Remove"
                                                    >
                                                        &times;
                                                    </button>
                                                    {(img.error || img.isOverLimit) && (
                                                        <div className="myproperty-error-msg" style={{
                                                            position: 'absolute',
                                                            bottom: -20,
                                                            left: 0,
                                                            right: 0,
                                                            fontSize: '0.75em',
                                                            textAlign: 'center',
                                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                                            padding: '2px 4px'
                                                        }}>
                                                            {img.error || `Over ${MAX_OTHER_IMAGES} limit`}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div ref={pricingOthersRef} className='row myproperty-section'>
                        <div className="myproperty-section-title-minimal">Pricing & Others</div>
                        <div className="col-md-12 inside-section-wrapper">
                            <div className="row">
                                <div className="col-md-4 inside-section-wrapper">
                                    <label className="myproperty-label">Ownership</label>
                                    <div className="myproperty-pill-group">
                                        {['Ownership', 'Power of Attorney'].map(opt => (
                                            <button
                                                key={opt}
                                                className={`myproperty-pill${formData.ownership === opt ? ' selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, ownership: opt })}
                                                type="button"
                                            >{opt}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-md-4 inside-section-wrapper">
                                    <label className="myproperty-label">Authority Approved</label>
                                    <div className="myproperty-pill-group">
                                        {['HSVP', 'MC', 'DTP', 'Other'].map(opt => (
                                            <button
                                                key={opt}
                                                className={`myproperty-pill${formData.authority === opt ? ' selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, authority: opt })}
                                                type="button"
                                            >{opt}</button>
                                        ))}
                                    </div>
                                </div>
                                {(formData.propertyType !== "Land") &&
                                <div className="col-md-4 inside-section-wrapper">
                                    <label className="myproperty-label">Other Rooms</label>
                                    <div className="myproperty-pill-group">
                                        {['Puja Room', 'Store Room', 'Study Room'].map(opt => (
                                            <button
                                                key={opt}
                                                className={`myproperty-pill${(formData.otherRooms || []).includes(opt) ? ' selected' : ''}`}
                                                onClick={() => {
                                                    const arr = formData.otherRooms || [];
                                                    setFormData({ ...formData, otherRooms: arr.includes(opt) ? arr.filter(v => v !== opt) : [...arr, opt] });
                                                }}
                                                type="button"
                                            >{opt}</button>
                                        ))}
                                    </div>
                                </div>
                                }
                                <div className="col-md-12 inside-section-wrapper">
                                    <label className="myproperty-label">Near By Facilities</label>
                                    <div className="myproperty-pill-group">
                                        {['Schools', 'Hospitals', 'Public Transportation', 'Shops/Malls', 'Restaurants', 'Parks/Green Spaces'].map(opt => (
                                            <button
                                                key={opt}
                                                className={`myproperty-pill${(formData.facilities || []).includes(opt) ? ' selected' : ''}`}
                                                onClick={() => {
                                                    const arr = formData.facilities || [];
                                                    setFormData({ ...formData, facilities: arr.includes(opt) ? arr.filter(v => v !== opt) : [...arr, opt] });
                                                }}
                                                type="button"
                                            >{opt}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-md-4 inside-section-wrapper">
                                    <label className="myproperty-label">Expected Amount <span style={{ color: '#ec161e' }}>*</span></label>
                                    <input
                                        className="myproperty-location-input"
                                        placeholder="Expected Amount"
                                        value={formData.amount || ''}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value.replace(/[^0-9]/g, '') })}
                                    />
                                    {formSubmit && !formData.amount && <div className="myproperty-error-msg">Expected Amount is required</div>}
                                    <div className="price-in-words" style={{ background: '#f6fbf6', color: '#388e3c', padding: '6px 12px', borderRadius: 4, fontSize: '1em', marginTop: 2 }}>
                                        {priceFormat(formData.amount)}
                                    </div>
                                </div>
                                <div className="col-md-8 inside-section-wrapper">
                                    <label className="myproperty-label">&nbsp;</label>
                                    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <label style={{ fontWeight: 500 }}>
                                            <input type="checkbox" checked={formData.negotiable || false} onChange={() => setFormData({ ...formData, negotiable: !formData.negotiable })} /> Price Negotiable
                                        </label>
                                        <label style={{ fontWeight: 500 }}>
                                            <input type="checkbox" checked={formData.rented || false} onChange={() => setFormData({ ...formData, rented: !formData.rented })} /> Already on Rented
                                        </label>
                                        <label style={{ fontWeight: 500 }}>
                                            <input type="checkbox" checked={formData.corner || false} onChange={() => setFormData({ ...formData, corner: !formData.corner })} /> Corner Property
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-12 inside-section-wrapper">
                                    <label className="myproperty-label">Property Description</label>
                                    <textarea
                                        className="myproperty-location-input"
                                        style={{ minHeight: 80, resize: 'vertical' }}
                                        placeholder="Property Description"
                                        value={formData.desc || ''}
                                        onChange={e => setFormData({ ...formData, desc: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button
                        onClick={handleSubmit}
                        style={{
                            background: '#1a73e8',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Save Changes
                    </button>
                </div>
            </LoadScript>
            <SuccessModal 
                open={showSuccessPopup}
                onClose={() => {
                    setShowSuccessPopup(false);
                    navigate('/dashboard');
                }}
            />
        </>
    )
}

export default MyProperty;