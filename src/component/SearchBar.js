import ReactJson from 'react-json-view'

const SearchBar = ({ list }) => {
    return <ReactJson src={list.map(m => m.value)} displayDataTypes={false} />
}

export default SearchBar