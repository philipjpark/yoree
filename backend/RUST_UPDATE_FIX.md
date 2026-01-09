# Fixing Rust/Cargo Edition2024 Issue

## Problem
The `home` crate v0.5.12 requires Rust 1.88+ (or edition2024), but your Cargo version (1.84.0) doesn't support this.

## Solution 1: Fix Rust Update (Recommended)

If `rustup update stable` fails with a rust-src conflict, try these steps:

### Step 1: Fix rust-src conflict
```powershell
# Remove the conflicting component
rustup component remove rust-src --toolchain stable

# Update rustup itself first
rustup self update

# Then update the stable toolchain
rustup update stable
```

### Step 2: If that doesn't work, try a clean reinstall
```powershell
# Backup your current toolchain (optional)
rustup toolchain list

# Remove and reinstall stable
rustup toolchain uninstall stable
rustup toolchain install stable
```

## Solution 2: Temporary Workaround (If you can't update Rust)

If updating Rust isn't possible right now, you can temporarily comment out the problematic dependencies:

1. In `backend/Cargo.toml`, comment out:
   ```toml
   # ethers = { version = "2.0", features = ["ws", "rustls"], default-features = false }
   # web3 = "0.19"
   ```

2. Comment out any code that uses these dependencies

3. Build the project without blockchain features

4. Once Rust is updated, uncomment and rebuild

## Solution 3: Use Nightly (Not Recommended for Production)

If you need to build immediately:
```powershell
rustup toolchain install nightly
rustup default nightly
```

Then build with:
```powershell
cd backend
cargo +nightly build
```

## Verification

After updating, verify your versions:
```powershell
rustc --version  # Should show 1.88.0 or higher
cargo --version  # Should show 1.88.0 or higher
```

## Why This Happens

The `home` crate is pulled in transitively by `ethers` or `web3` dependencies. Newer versions of these crates require newer Rust versions. The cleanest solution is to update your Rust toolchain.
