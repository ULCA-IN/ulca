import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {Button, Grid} from '@material-ui/core';


function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function SimpleTabs(props) {
    return (
        <div>
            <AppBar style={{ borderTop: "none", borderRight: "none", borderLeft: "none", marginTop: '10px' }} position="static" color="inherit">
                <Grid container>    
                    <Grid item xs={9} sm={9} md={9} lg={9} xl={9}>
                        <Tabs value={props.value} onChange={props.handleChange} aria-label="simple tabs example">
                        {
                            props.tabs.map((tab, index) => {
                                return (
                                    <Tab label={tab.label} {...a11yProps(index)} />
                                )
                            })
                        }
                    </Tabs>
                    </Grid>
                    <Grid item><Button>Search</Button></Grid>
                    <Grid item><Button variant="outlined">Filter</Button>
                    </Grid>
                </Grid>
            </AppBar>
            {
                props.children
            }
        </div>
    );
}
