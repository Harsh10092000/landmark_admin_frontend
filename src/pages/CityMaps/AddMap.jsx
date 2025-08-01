import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context2/AuthContext';
import SessionOutLoginAgain from '../../components/Table/SessionOutLoginAgain';
import Loading from '../../components/Loading';

const AddMap = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        map_city: '',
        map_state: '',
        map_category: '',
        map_sub_category: ''
    });
    
    const [mapImage, setMapImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [formSubmit, setFormSubmit] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // Image validation constants
    const MAX_SIZE = 5000000; // 5MB
    const MIN_SIZE = 10000;   // 10KB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

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

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get( import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV + '/api/cityMap/fetchMapCategory');
            if (response.data) {
                setCategories(response.data.map(item => item.map_category));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Image validation helper
    const validateImage = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return "Invalid format (only JPG, PNG, WEBP)";
        }
        if (file.size > MAX_SIZE) {
            return "File too large (max 5MB)";
        }
        if (file.size < MIN_SIZE) {
            return "File too small (min 10KB)";
        }
        return "";
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const error = validateImage(file);
            
            setMapImage({
                file,
                error,
                preview: URL.createObjectURL(file)
            });
        }
        e.target.value = "";
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'add_new') {
            setShowNewCategory(true);
            setFormData({ ...formData, map_category: '' });
        } else {
            setShowNewCategory(false);
            setFormData({ ...formData, map_category: value });
        }
    };

    const handleSubmit = async () => {
        try {
            setFormSubmit(true);

            // Validation
            if (!formData.map_city) {
                alert("City is required");
                setFormSubmit(false);
                return;
            }
            if (!formData.map_state) {
                alert("State is required");
                setFormSubmit(false);
                return;
            }
            if (!formData.map_category && !newCategory) {
                alert("Category is required");
                setFormSubmit(false);
                return;
            }
            if (!formData.map_sub_category) {
                alert("Sub Category is required");
                setFormSubmit(false);
                return;
            }
            if (!mapImage || !mapImage.file) {
                alert("Map Image is required");
                setFormSubmit(false);
                return;
            }
            if (mapImage.error) {
                alert("Please fix image errors before submitting");
                setFormSubmit(false);
                return;
            }

            // Check if sub-category already exists for this city and category
            const finalCategory = showNewCategory ? newCategory : formData.map_category;
            try {
                const checkResponse = await axios.get(
                    import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV + 
                    `/api/cityMap/checkSubCategory/${formData.map_city}/${finalCategory}/${formData.map_sub_category}`
                );
                
                if (checkResponse.data && checkResponse.data.length > 0) {
                    alert("A map with this city, category, and sub-category combination already exists!");
                    setFormSubmit(false);
                    return;
                }
            } catch (error) {
                console.error('Error checking sub-category:', error);
            }

            // Create FormData for image upload
            const formDataToSend = new FormData();
            formDataToSend.append('map_city', formData.map_city);
            formDataToSend.append('map_state', formData.map_state);
            formDataToSend.append('map_category', finalCategory);
            formDataToSend.append('map_sub_category', formData.map_sub_category);
            formDataToSend.append('image', mapImage.file);

            // Submit the form with image
            const response = await axios.post(
                import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV + '/api/cityMap/addMap',
                formDataToSend,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data === "Inserted Successfully") {
                setFormSubmit(false);
                setShowSuccessPopup(true);
            } else {
                setFormSubmit(false);
                alert("Failed to add map. Please try again.");
            }
        } catch (error) {
            console.error("Error adding map:", error);
            setFormSubmit(false);
            alert("An error occurred while adding the map.");
        }
    };

    // Success Modal Component
    const SuccessModal = ({ open, onClose }) => {
        return (
            <>
                {open && (
                    <div className="modal-backdrop">
                        <div className="modern-modal">
                            <div className="modal-icon">
                                <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="12" fill="#f0fff4" />
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#38a169" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="modal-content">
                                <h2 className="modal-title">Success!</h2>
                                <div className="modal-subtext">City map has been added successfully</div>
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

    return (
        <>
            {formSubmit && <Loading />}
            <div className='dashboard-main-wrapper'>
                <div className="tab_section_wrapper">
                    <div className="tab_section">
                        <div className="tab_section-item tab_section-item-selected">
                            Add City Map
                        </div>
                    </div>
                </div>
            </div>
            
            <div className='main-wrapper'>
                <div className='row myproperty-section'>
                    <div className="myproperty-section-title-minimal">Map Details</div>
                    
                    <div className="col-md-6 inside-section-wrapper">
                        <label className="myproperty-label">City <span style={{ color: '#ec161e' }}>*</span></label>
                        <input
                            type="text"
                            className="myproperty-location-input"
                            placeholder="Enter City Name"
                            value={formData.map_city}
                            onChange={(e) => setFormData({ ...formData, map_city: e.target.value })}
                        />
                        {formSubmit && !formData.map_city && <div className="myproperty-error-msg">City is required</div>}
                    </div>
                    
                    <div className="col-md-6 inside-section-wrapper">
                        <label className="myproperty-label">State <span style={{ color: '#ec161e' }}>*</span></label>
                        <input
                            type="text"
                            className="myproperty-location-input"
                            placeholder="Enter State Name"
                            value={formData.map_state}
                            onChange={(e) => setFormData({ ...formData, map_state: e.target.value })}
                        />
                        {formSubmit && !formData.map_state && <div className="myproperty-error-msg">State is required</div>}
                    </div>
                    
                    <div className="col-md-6 inside-section-wrapper">
                        <label className="myproperty-label">Category <span style={{ color: '#ec161e' }}>*</span></label>
                        {!showNewCategory ? (
                            <select
                                className="myproperty-location-input"
                                value={formData.map_category}
                                onChange={handleCategoryChange}
                            >
                                <option value="">Select Category</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>{category}</option>
                                ))}
                                <option value="add_new">+ Add New Category</option>
                            </select>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    className="myproperty-location-input"
                                    placeholder="Enter New Category"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="myproperty-pill"
                                    style={{ marginTop: '8px', fontSize: '12px' }}
                                    onClick={() => {
                                        setShowNewCategory(false);
                                        setNewCategory('');
                                        setFormData({ ...formData, map_category: '' });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        {formSubmit && !formData.map_category && !newCategory && <div className="myproperty-error-msg">Category is required</div>}
                    </div>
                    
                    <div className="col-md-6 inside-section-wrapper">
                        <label className="myproperty-label">Sub Category <span style={{ color: '#ec161e' }}>*</span></label>
                        <input
                            type="text"
                            className="myproperty-location-input"
                            placeholder="Enter Sub Category"
                            value={formData.map_sub_category}
                            onChange={(e) => setFormData({ ...formData, map_sub_category: e.target.value })}
                        />
                        {formSubmit && !formData.map_sub_category && <div className="myproperty-error-msg">Sub Category is required</div>}
                    </div>
                    
                    <div className="col-md-12 inside-section-wrapper">
                        <label className="myproperty-label">Map Image <span style={{ color: '#ec161e' }}>*</span></label>
                        <input
                            type="file"
                            className="myproperty-location-input"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                        />
                        <div className="image-upload-note" style={{fontSize: '0.85em', color: '#666', marginTop: 4}}>
                            (JPG, PNG, WEBP, 10KB - 5MB)
                        </div>
                        {mapImage && (
                            <div style={{marginTop: 8, position: 'relative', display: 'inline-block'}}>
                                <img
                                    src={mapImage.preview}
                                    alt="map preview"
                                    style={{ 
                                        width: 200, 
                                        height: 150, 
                                        objectFit: 'cover', 
                                        borderRadius: 6,
                                        border: mapImage.error ? '2px solid #ec161e' : 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    className="myproperty-image-remove-btn"
                                    style={{ position: 'absolute', top: 4, right: 4 }}
                                    onClick={() => setMapImage(null)}
                                    title="Remove"
                                >
                                    &times;
                                </button>
                                {mapImage.error && (
                                    <div className="myproperty-error-msg" style={{marginTop: 4}}>
                                        {mapImage.error}
                                    </div>
                                )}
                            </div>
                        )}
                        {formSubmit && !mapImage && <div className="myproperty-error-msg">Map Image is required</div>}
                    </div>
                </div>
                
                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button
                        onClick={handleSubmit}
                        disabled={formSubmit}
                        style={{
                            background: '#1a73e8',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            cursor: formSubmit ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(26, 115, 232, 0.2)',
                            opacity: formSubmit ? 0.7 : 1
                        }}
                        onMouseOver={(e) => {
                            if (!formSubmit) {
                                e.target.style.background = '#1557b0';
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(26, 115, 232, 0.3)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!formSubmit) {
                                e.target.style.background = '#1a73e8';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(26, 115, 232, 0.2)';
                            }
                        }}
                    >
                        {formSubmit ? "Adding..." : "Add Map"}
                    </button>
                </div>
            </div>
            
            <SuccessModal 
                open={showSuccessPopup}
                onClose={() => {
                    setShowSuccessPopup(false);
                    navigate('/view-maps');
                }}
            />
        </>
    );
};

export default AddMap;
