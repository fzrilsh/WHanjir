import SearchIcon from './icons/SearchIcon'

function SearchBar({ onClick }) {
  return (
    <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[360px] z-10 pointer-events-auto">
      <button
        type="button"
        onClick={onClick}
        className="w-full h-[56px] bg-white rounded-[16px] shadow-lg flex items-center gap-3 px-4 hover:shadow-xl transition-shadow cursor-pointer"
      >
        <span className="text-[14px] text-[#49454F] font-normal flex-1 text-left select-none">
          Pencarian jalan
        </span>
        <SearchIcon className="w-6 h-6 text-[#49454F] shrink-0" />
      </button>
    </div>
  )
}

export default SearchBar
