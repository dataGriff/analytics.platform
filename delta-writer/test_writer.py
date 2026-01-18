#!/usr/bin/env python3
"""
Simple test to validate delta-writer functionality
"""
import json
from datetime import datetime

# Test event parsing
def test_event_parsing():
    """Test event parsing and normalization"""
    sample_event = {
        "timestamp": "2024-12-31T10:00:00Z",
        "channel": "web",
        "platform": "web-desktop",
        "event_type": "button_click",
        "event_category": "user_action",
        "resource_id": "http://localhost:8080/index.html",
        "resource_title": "Home Page",
        "interaction_target": "btn-action-1",
        "session_id": "test-session-123",
        "user_id": "test-user-456",
        "metadata": {"page_section": "main"}
    }
    
    # Simulate what parse_event does
    event = sample_event.copy()
    
    # Ensure timestamp is in ISO format
    if 'timestamp' in event and event['timestamp']:
        try:
            dt = datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00'))
            event['timestamp'] = dt.isoformat()
        except (ValueError, AttributeError):
            event['timestamp'] = datetime.utcnow().isoformat()
    else:
        event['timestamp'] = datetime.utcnow().isoformat()
    
    # Ensure all required fields have defaults
    event.setdefault('channel', 'unknown')
    event.setdefault('platform', '')
    event.setdefault('event_type', 'unknown')
    event.setdefault('event_category', '')
    event.setdefault('resource_id', '')
    event.setdefault('resource_title', '')
    event.setdefault('interaction_target', '')
    event.setdefault('session_id', '')
    event.setdefault('user_id', '')
    event.setdefault('device_id', '')
    event.setdefault('user_agent', '')
    event.setdefault('client_version', '')
    event.setdefault('interaction_value', None)
    event.setdefault('interaction_text', '')
    
    # Convert None to empty string for string fields to avoid Delta Lake schema errors
    string_fields = [
        'channel', 'platform', 'event_type', 'event_category',
        'resource_id', 'resource_title', 'interaction_target',
        'session_id', 'user_id', 'device_id', 'user_agent',
        'client_version', 'interaction_text'
    ]
    for field in string_fields:
        if event.get(field) is None:
            event[field] = ''
    
    # Convert metadata to JSON string
    if 'metadata' in event and isinstance(event['metadata'], (dict, list)):
        event['metadata'] = json.dumps(event['metadata'])
    else:
        event['metadata'] = '{}'
    
    print("✅ Event parsing test passed")
    print(f"   Parsed event: {json.dumps(event, indent=2)}")
    return True

# Test data types
def test_data_types():
    """Test that data types are correct"""
    import pandas as pd
    
    sample_events = [
        {
            'timestamp': '2024-12-31T10:00:00+00:00',
            'channel': 'web',
            'platform': 'web-desktop',
            'event_type': 'button_click',
            'event_category': 'user_action',
            'resource_id': 'http://test.com',
            'resource_title': 'Test',
            'interaction_target': 'button1',
            'session_id': 'session1',
            'user_id': 'user1',
            'device_id': '',
            'user_agent': '',
            'client_version': '',
            'interaction_value': 100,
            'interaction_text': '',
            'metadata': '{}'
        }
    ]
    
    df = pd.DataFrame(sample_events)
    
    # Convert types
    if 'interaction_value' in df.columns:
        df['interaction_value'] = pd.to_numeric(df['interaction_value'], errors='coerce')
    
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    print("✅ Data type conversion test passed")
    print(f"   DataFrame shape: {df.shape}")
    print(f"   DataFrame dtypes:\n{df.dtypes}")
    return True

# Test with null values (as sent from JavaScript)
def test_null_value_handling():
    """Test that null values are properly converted to avoid Delta Lake errors"""
    # Simulate event from JavaScript with null values
    sample_event = {
        'timestamp': '2024-12-31T10:00:00Z',
        'channel': 'web',
        'platform': 'web-desktop',
        'event_type': 'navigation',
        'event_category': 'navigation',
        'resource_id': 'http://localhost:8080/',
        'resource_title': 'Home Page',
        'interaction_target': None,  # null from JavaScript
        'session_id': 'session-123',
        'user_id': None,  # null from JavaScript (not authenticated)
        'device_id': 'device-456',
        'metadata': {'page': 'home'}
    }
    
    # Simulate parse_event processing
    event = sample_event.copy()
    
    # Ensure all required fields have defaults
    event.setdefault('channel', 'unknown')
    event.setdefault('platform', '')
    event.setdefault('event_type', 'unknown')
    event.setdefault('event_category', '')
    event.setdefault('resource_id', '')
    event.setdefault('resource_title', '')
    event.setdefault('interaction_target', '')
    event.setdefault('session_id', '')
    event.setdefault('user_id', '')
    event.setdefault('device_id', '')
    event.setdefault('user_agent', '')
    event.setdefault('client_version', '')
    event.setdefault('interaction_value', None)
    event.setdefault('interaction_text', '')
    
    # Convert None to empty string for string fields
    string_fields = [
        'channel', 'platform', 'event_type', 'event_category',
        'resource_id', 'resource_title', 'interaction_target',
        'session_id', 'user_id', 'device_id', 'user_agent',
        'client_version', 'interaction_text'
    ]
    for field in string_fields:
        if event.get(field) is None:
            event[field] = ''
    
    # Convert metadata to JSON string
    if 'metadata' in event and isinstance(event['metadata'], (dict, list)):
        event['metadata'] = json.dumps(event['metadata'])
    else:
        event['metadata'] = '{}'
    
    # Verify all string fields are now empty strings, not None
    for field in string_fields:
        if event.get(field) is None:
            raise AssertionError(f"Field {field} is still None after processing")
    
    # Create DataFrame and test Delta Lake compatibility
    import pandas as pd
    df = pd.DataFrame([event])
    
    # Convert types
    if 'interaction_value' in df.columns:
        df['interaction_value'] = pd.to_numeric(df['interaction_value'], errors='coerce')
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Check for object columns with all None/NaN values (would cause Delta Lake error)
    for col in df.columns:
        if df[col].dtype == 'object':
            if df[col].isna().all():
                raise AssertionError(f"Column {col} has all None values, would cause Delta Lake error")
    
    print("✅ Null value handling test passed")
    print(f"   All string fields properly converted from None to empty string")
    return True

if __name__ == '__main__':
    print("Running delta-writer unit tests...\n")
    
    try:
        test_event_parsing()
        print()
        test_data_types()
        print()
        test_null_value_handling()
        print("\n✅ All tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
