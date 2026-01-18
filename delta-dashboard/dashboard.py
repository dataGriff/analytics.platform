#!/usr/bin/env python3
"""
Delta Lake Analytics Dashboard

Interactive dashboard for visualizing analytics events stored in Delta Lake.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from deltalake import DeltaTable
import os
from datetime import datetime, timedelta

# Configure page
st.set_page_config(
    page_title="Delta Lake Analytics Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Delta Lake configuration
DELTA_TABLE_PATH = os.getenv('DELTA_TABLE_PATH', 's3://analytics/delta/analytics-events')
AWS_ENDPOINT_URL = os.getenv('AWS_ENDPOINT_URL', 'http://minio:9000')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', 'minioadmin')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', 'minioadmin')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
AWS_ALLOW_HTTP = os.getenv('AWS_ALLOW_HTTP', 'true')

# Storage options for Delta Lake
storage_options = {
    'AWS_ENDPOINT_URL': AWS_ENDPOINT_URL,
    'AWS_ACCESS_KEY_ID': AWS_ACCESS_KEY_ID,
    'AWS_SECRET_ACCESS_KEY': AWS_SECRET_ACCESS_KEY,
    'AWS_REGION': AWS_REGION,
    'AWS_ALLOW_HTTP': AWS_ALLOW_HTTP,
    'AWS_S3_ALLOW_UNSAFE_RENAME': 'true'
}

@st.cache_data(ttl=60)
def load_delta_data():
    """Load data from Delta Lake with caching."""
    try:
        dt = DeltaTable(DELTA_TABLE_PATH, storage_options=storage_options)
        df = dt.to_pandas()
        
        # Ensure timestamp is datetime
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        return df, None
    except Exception as e:
        return None, str(e)

def format_number(num):
    """Format large numbers with K, M suffixes."""
    if num >= 1_000_000:
        return f"{num/1_000_000:.1f}M"
    elif num >= 1_000:
        return f"{num/1_000:.1f}K"
    return str(num)

def main():
    st.title("📊 Delta Lake Analytics Dashboard")
    st.markdown("Real-time analytics from Delta Lake storage")
    
    # Sidebar controls
    st.sidebar.header("🎛️ Filters")
    auto_refresh = st.sidebar.checkbox("Auto-refresh (60s)", value=False)
    
    if auto_refresh:
        st.sidebar.info("Dashboard will refresh every 60 seconds")
    
    # Manual refresh button
    if st.sidebar.button("🔄 Refresh Data"):
        st.cache_data.clear()
        st.rerun()
    
    # Load data
    with st.spinner("Loading data from Delta Lake..."):
        df, error = load_delta_data()
    
    if error:
        st.error(f"❌ Error loading Delta Lake data: {error}")
        st.info("Make sure the delta-writer service has written some data to Delta Lake.")
        return
    
    if df is None or df.empty:
        st.warning("📭 No data available yet. Waiting for events to be written to Delta Lake...")
        st.info("Generate some events by visiting the demo applications:")
        st.markdown("- Website: http://localhost:8080")
        st.markdown("- Chat App: http://localhost:8082")
        return
    
    # Apply filters
    st.sidebar.subheader("Filter Data")
    
    # Date range filter
    if 'timestamp' in df.columns:
        min_date = df['timestamp'].min().date()
        max_date = df['timestamp'].max().date()
        
        date_range = st.sidebar.date_input(
            "Date Range",
            value=(min_date, max_date),
            min_value=min_date,
            max_value=max_date
        )
        
        if len(date_range) == 2:
            start_date, end_date = date_range
            mask = (df['timestamp'].dt.date >= start_date) & (df['timestamp'].dt.date <= end_date)
            df = df[mask]
    
    # Channel filter
    if 'channel' in df.columns:
        channels = ['All'] + sorted(df['channel'].unique().tolist())
        selected_channel = st.sidebar.selectbox("Channel", channels)
        if selected_channel != 'All':
            df = df[df['channel'] == selected_channel]
    
    # Event type filter
    if 'event_type' in df.columns:
        event_types = ['All'] + sorted(df['event_type'].unique().tolist())
        selected_event = st.sidebar.selectbox("Event Type", event_types)
        if selected_event != 'All':
            df = df[df['event_type'] == selected_event]
    
    # Display metadata
    st.sidebar.markdown("---")
    st.sidebar.metric("Total Events", format_number(len(df)))
    if 'timestamp' in df.columns:
        st.sidebar.metric("Date Range", f"{df['timestamp'].min().strftime('%Y-%m-%d')} to {df['timestamp'].max().strftime('%Y-%m-%d')}")
    
    # Main dashboard content
    
    # Key Metrics Row
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_events = len(df)
        st.metric("📈 Total Events", format_number(total_events))
    
    with col2:
        if 'channel' in df.columns:
            unique_channels = df['channel'].nunique()
            st.metric("📡 Channels", unique_channels)
        else:
            st.metric("📡 Channels", "N/A")
    
    with col3:
        if 'session_id' in df.columns:
            unique_sessions = df['session_id'].nunique()
            st.metric("👥 Sessions", format_number(unique_sessions))
        else:
            st.metric("👥 Sessions", "N/A")
    
    with col4:
        if 'event_type' in df.columns:
            unique_events = df['event_type'].nunique()
            st.metric("🎯 Event Types", unique_events)
        else:
            st.metric("🎯 Event Types", "N/A")
    
    # Charts Section
    st.markdown("---")
    
    # Events over time
    if 'timestamp' in df.columns:
        st.subheader("📅 Events Over Time")
        
        # Group by hour
        df_time = df.copy()
        df_time['hour'] = df_time['timestamp'].dt.floor('H')
        time_series = df_time.groupby('hour').size().reset_index(name='count')
        
        fig_time = px.line(
            time_series,
            x='hour',
            y='count',
            title='Event Volume by Hour',
            labels={'hour': 'Time', 'count': 'Number of Events'}
        )
        fig_time.update_traces(mode='lines+markers')
        fig_time.update_layout(height=400)
        st.plotly_chart(fig_time, use_container_width=True)
    
    # Two column layout for channel and event breakdown
    col1, col2 = st.columns(2)
    
    with col1:
        if 'channel' in df.columns:
            st.subheader("📡 Events by Channel")
            channel_counts = df['channel'].value_counts().reset_index()
            channel_counts.columns = ['channel', 'count']
            
            fig_channel = px.pie(
                channel_counts,
                values='count',
                names='channel',
                title='Distribution by Channel'
            )
            fig_channel.update_traces(textposition='inside', textinfo='percent+label')
            st.plotly_chart(fig_channel, use_container_width=True)
    
    with col2:
        if 'event_type' in df.columns:
            st.subheader("🎯 Events by Type")
            event_counts = df['event_type'].value_counts().head(10).reset_index()
            event_counts.columns = ['event_type', 'count']
            
            fig_events = px.bar(
                event_counts,
                x='count',
                y='event_type',
                orientation='h',
                title='Top 10 Event Types'
            )
            fig_events.update_layout(yaxis={'categoryorder': 'total ascending'})
            st.plotly_chart(fig_events, use_container_width=True)
    
    # Platform and Category breakdown
    col1, col2 = st.columns(2)
    
    with col1:
        if 'platform' in df.columns and df['platform'].notna().any():
            st.subheader("💻 Platform Distribution")
            platform_counts = df[df['platform'] != '']['platform'].value_counts().head(10).reset_index()
            platform_counts.columns = ['platform', 'count']
            
            if not platform_counts.empty:
                fig_platform = px.bar(
                    platform_counts,
                    x='platform',
                    y='count',
                    title='Events by Platform'
                )
                st.plotly_chart(fig_platform, use_container_width=True)
    
    with col2:
        if 'event_category' in df.columns and df['event_category'].notna().any():
            st.subheader("📂 Event Categories")
            category_counts = df[df['event_category'] != '']['event_category'].value_counts().reset_index()
            category_counts.columns = ['category', 'count']
            
            if not category_counts.empty:
                fig_category = px.bar(
                    category_counts,
                    x='category',
                    y='count',
                    title='Events by Category'
                )
                st.plotly_chart(fig_category, use_container_width=True)
    
    # Heatmap: Events by Channel and Type
    if 'channel' in df.columns and 'event_type' in df.columns:
        st.markdown("---")
        st.subheader("🔥 Event Heatmap: Channel × Event Type")
        
        heatmap_data = df.groupby(['channel', 'event_type']).size().reset_index(name='count')
        heatmap_pivot = heatmap_data.pivot(index='event_type', columns='channel', values='count').fillna(0)
        
        fig_heatmap = px.imshow(
            heatmap_pivot,
            labels=dict(x="Channel", y="Event Type", color="Count"),
            aspect="auto",
            color_continuous_scale="YlOrRd"
        )
        fig_heatmap.update_layout(height=max(400, len(heatmap_pivot) * 30))
        st.plotly_chart(fig_heatmap, use_container_width=True)
    
    # Recent events table
    st.markdown("---")
    st.subheader("📋 Recent Events")
    
    # Select relevant columns to display
    display_cols = ['timestamp', 'channel', 'event_type', 'event_category', 'session_id']
    available_cols = [col for col in display_cols if col in df.columns]
    
    if available_cols:
        recent_df = df[available_cols].sort_values('timestamp', ascending=False).head(100)
        st.dataframe(recent_df, use_container_width=True, height=400)
    
    # Data export
    st.markdown("---")
    st.subheader("💾 Export Data")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Export as CSV
        csv = df.to_csv(index=False)
        st.download_button(
            label="📥 Download as CSV",
            data=csv,
            file_name=f"delta_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv"
        )
    
    with col2:
        # Show dataset info
        st.info(f"Dataset contains {len(df)} events with {len(df.columns)} columns")
    
    # Auto-refresh logic
    if auto_refresh:
        import time
        time.sleep(60)
        st.cache_data.clear()
        st.rerun()

if __name__ == "__main__":
    main()
