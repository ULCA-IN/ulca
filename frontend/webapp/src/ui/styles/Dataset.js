


const drawerWidth = 240;
//let logo = require('../../../assets/logo.png')

const DataSet = (theme) => ({
    divStyle: {
        // margin: "1.5rem 23rem 3% 17.5rem",
        margin:'1.5rem 20% 3% 15.5%',
        overflow: 'auto'
    },
    root: {
        padding: 0,
        margin: "1.5rem 23rem 3% 17.5rem",
        height: window.innerHeight,
        overflow: 'auto'
    },
    paper: {
        padding: '5%',
    },
    title: {
        marginBottom: '3vh'
    },
    form: {
        marginTop: '1vh',
        width: '100%',
    },
    radioGroup: {
        marginTop: '1vh',
        paddingRight: '2vw'
    },

    updateBtn: {
        backgroundColor: "white",
        border: '1px solid black',
        display: 'flex',
        justifyItems: 'center',
        marginLeft: 'auto',
        marginTop: '-4%',
    },
    submitBtn: {
        marginTop: '6vh',
        color: 'white',
        fontSize: '1rem'
    },
    breadcrum: {
        marginBottom: '1.5rem'
    },
    link: {
        color: "rgb(158 84 147)",
        marginRight: "10px",
        cursor: "pointer"
    },
    span: {
        color: "green"
    },
    searchDataset: {
        maxHeight: '1.875rem',
    },
    submittedOn: {
        display: 'block',
        marginTop: '-0.3rem'
    },
    updateDataset: {
        padding: '2rem',
        width: '21rem',
        height: 'auto',
        overflow: 'auto'
    },
    datasetName: {
        borderBottom: '1px solid #e0e1e0',
        borderTop: '1px solid #e0e1e0'
    },
    popOver: {
        marginTop: '0.3rem'
    },
    footerButtons: {
        display: "flex", 
        justifyContent: 'flex-end', 
        width: "100%",
        padding:'.6rem 1rem',
        boxSizing: 'border-box',
        border: "1px solid rgb(224 224 224)",
    background: "white",
    marginTop:"-3px"
      },

      headerButtons:{
        display: "flex", 
        justifyContent: 'flex-end', 
        width: "100%",
        marginBottom:'.6rem',
        boxSizing: 'border-box',
        
    
      },
      buttonStyle:{
          marginLeft:"0.7rem"
      },
      iconStyle:{marginRight: '.5rem'}
});

export default DataSet;