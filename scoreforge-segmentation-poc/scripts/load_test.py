#!/usr/bin/env python3
"""
Load testing script for the Gaming Leaderboard API
Simulates real user behavior with continuous requests
"""

import requests
import random
import time
import threading
from datetime import datetime
import statistics

API_BASE_URL = "http://localhost:8000/api/leaderboard"
GAME_MODES = ["story", "multiplayer"]

# Statistics tracking
stats = {
    "submissions": {"count": 0, "times": []},
    "top_players": {"count": 0, "times": []},
    "rank_lookup": {"count": 0, "times": []},
    "errors": 0,
}


def submit_score(user_id):
    """Simulate score submission"""
    start_time = time.time()
    try:
        score = random.randint(100, 10000)
        game_mode = random.choice(GAME_MODES)
        response = requests.post(
            f"{API_BASE_URL}/submit",
            json={"user_id": user_id, "score": score, "game_mode": game_mode},
            timeout=5,
        )
        elapsed = time.time() - start_time
        stats["submissions"]["count"] += 1
        stats["submissions"]["times"].append(elapsed)
        
        if response.status_code != 200:
            stats["errors"] += 1
            print(f"❌ Submit error: {response.status_code}")
    except Exception as e:
        stats["errors"] += 1
        print(f"❌ Submit exception: {e}")


def get_top_players():
    """Fetch top players"""
    start_time = time.time()
    try:
        game_mode = random.choice(GAME_MODES)
        limit = random.choice([10, 20, 50])
        response = requests.get(
            f"{API_BASE_URL}/top?limit={limit}&game_mode={game_mode}",
            timeout=5,
        )
        elapsed = time.time() - start_time
        stats["top_players"]["count"] += 1
        stats["top_players"]["times"].append(elapsed)
        
        if response.status_code != 200:
            stats["errors"] += 1
    except Exception as e:
        stats["errors"] += 1
        print(f"❌ Top players exception: {e}")


def get_user_rank(user_id):
    """Fetch user rank"""
    start_time = time.time()
    try:
        game_mode = random.choice(GAME_MODES)
        response = requests.get(
            f"{API_BASE_URL}/rank/{user_id}?game_mode={game_mode}",
            timeout=5,
        )
        elapsed = time.time() - start_time
        stats["rank_lookup"]["count"] += 1
        stats["rank_lookup"]["times"].append(elapsed)
        
        if response.status_code != 200:
            stats["errors"] += 1
    except Exception as e:
        elapsed = time.time() - start_time
        stats["rank_lookup"]["count"] += 1
        stats["rank_lookup"]["times"].append(elapsed)
        stats["errors"] += 1
        print(f"❌ Rank lookup exception: {e}")


def worker_thread(thread_id, duration):
    """Worker thread that simulates user activity"""
    end_time = time.time() + duration
    request_count = 0
    
    while time.time() < end_time:
        user_id = random.randint(1, 1000000)
        
        # Randomly choose an action
        action = random.choices(
            ["submit", "top", "rank"],
            weights=[50, 30, 20],  # 50% submits, 30% top, 20% rank
        )[0]
        
        if action == "submit":
            submit_score(user_id)
        elif action == "top":
            get_top_players()
        elif action == "rank":
            get_user_rank(user_id)
        
        request_count += 1
        
        # Random delay between requests
        time.sleep(random.uniform(0.1, 0.5))
    
    print(f"Thread {thread_id} completed {request_count} requests")


def print_stats():
    """Print statistics periodically"""
    while True:
        time.sleep(10)
        print("\n" + "=" * 60)
        print(f"📊 Statistics at {datetime.now().strftime('%H:%M:%S')}")
        print("=" * 60)
        
        for endpoint, data in stats.items():
            if endpoint == "errors":
                print(f"❌ Total Errors: {data}")
            elif data["count"] > 0:
                times = data["times"]
                avg_time = statistics.mean(times)
                median_time = statistics.median(times)
                p95_time = statistics.quantiles(times, n=20)[18] if len(times) > 20 else max(times)
                
                print(f"\n{endpoint.upper()}:")
                print(f"  Count: {data['count']}")
                print(f"  Avg Latency: {avg_time*1000:.2f}ms")
                print(f"  Median Latency: {median_time*1000:.2f}ms")
                print(f"  P95 Latency: {p95_time*1000:.2f}ms")
        
        print("=" * 60 + "\n")


def main():
    """Main function"""
    print("🚀 Starting Load Test for Gaming Leaderboard API")
    print(f"Target: {API_BASE_URL}")
    print("\nPress Ctrl+C to stop\n")
    
    # Test connection
    try:
        response = requests.get(f"{API_BASE_URL.replace('/api/leaderboard', '')}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is reachable\n")
        else:
            print("⚠️  Server returned non-200 status\n")
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        return
    
    # Configuration
    num_threads = 10  # Number of concurrent users
    duration = 300  # Duration in seconds (5 minutes)
    
    # Start stats printer thread
    stats_thread = threading.Thread(target=print_stats, daemon=True)
    stats_thread.start()
    
    # Start worker threads
    threads = []
    for i in range(num_threads):
        thread = threading.Thread(target=worker_thread, args=(i + 1, duration))
        thread.start()
        threads.append(thread)
    
    # Wait for all threads to complete
    try:
        for thread in threads:
            thread.join()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    
    # Final statistics
    print("\n" + "=" * 60)
    print("📊 FINAL STATISTICS")
    print("=" * 60)
    
    total_requests = (
        stats["submissions"]["count"]
        + stats["top_players"]["count"]
        + stats["rank_lookup"]["count"]
    )
    
    print(f"\nTotal Requests: {total_requests}")
    print(f"Total Errors: {stats['errors']}")
    print(f"Error Rate: {(stats['errors']/total_requests*100):.2f}%" if total_requests > 0 else "N/A")
    
    for endpoint, data in stats.items():
        if endpoint == "errors":
            continue
        if data["count"] > 0:
            times = data["times"]
            avg_time = statistics.mean(times)
            median_time = statistics.median(times)
            p95_time = statistics.quantiles(times, n=20)[18] if len(times) > 20 else max(times)
            min_time = min(times)
            max_time = max(times)
            
            print(f"\n{endpoint.upper()}:")
            print(f"  Count: {data['count']}")
            print(f"  Min: {min_time*1000:.2f}ms")
            print(f"  Max: {max_time*1000:.2f}ms")
            print(f"  Avg: {avg_time*1000:.2f}ms")
            print(f"  Median: {median_time*1000:.2f}ms")
            print(f"  P95: {p95_time*1000:.2f}ms")
    
    print("=" * 60)


if __name__ == "__main__":
    main()

