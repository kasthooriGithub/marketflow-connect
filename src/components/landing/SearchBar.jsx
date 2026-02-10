import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const quickCategories = [
    'SEO',
    'Social Media',
    'Logo Design',
    'Video Editing',
    'Web Development'
];

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/services?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleCategoryClick = (category) => {
        navigate(`/services?q=${encodeURIComponent(category)}`);
    };

    return (
        <div className="search-bar-container mx-auto" style={{ maxWidth: '800px' }}>
            <form onSubmit={handleSearch} className="position-relative mb-4">
                <div
                    className="d-flex align-items-center bg-white rounded-4 overflow-hidden"
                    style={{
                        border: isFocused ? '2px solid #00B67A' : '2px solid #E4E5E7',
                        boxShadow: isFocused ? '0 8px 24px rgba(0, 182, 122, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        padding: '4px'
                    }}
                >
                    <Search className="ms-3 d-none d-sm-block" size={20} style={{ color: '#95979D' }} />
                    <input
                        type="text"
                        className="form-control border-0 py-3 px-3"
                        placeholder="Try 'SEO', 'Social Media Ads', 'Logo Design'..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{
                            fontSize: '1.1rem',
                            boxShadow: 'none',
                            color: '#404145',
                            backgroundColor: 'transparent'
                        }}
                    />
                    <button
                        type="submit"
                        className="btn px-4 py-2 fw-bold text-white shadow-sm"
                        style={{
                            background: '#0A2540',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            minWidth: '120px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Search
                    </button>
                </div>
            </form>

            <div className="d-flex align-items-center gap-2">
                <span className="text-muted small fw-semibold flex-shrink-0 d-none d-md-inline">Popular:</span>
                <div
                    className="d-flex gap-2 overflow-auto pb-2 no-scrollbar mobile-scroll-container"
                    style={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                    }}
                >
                    {quickCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className="btn btn-sm border-0 px-3 py-2 rounded-pill fw-medium flex-shrink-0"
                            style={{
                                background: '#F0F2F5',
                                color: '#404145',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#E4E5E7';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#F0F2F5';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .mobile-scroll-container {
                    mask-image: linear-gradient(to right, black 85%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
                }
                @media (max-width: 576px) {
                    .search-bar-container .btn {
                        min-width: 80px;
                    }
                }
            `}</style>
        </div>
    );
}
