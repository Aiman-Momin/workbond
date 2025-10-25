#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, vec, Address, Env, Symbol, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Escrow {
    pub client: Address,
    pub freelancer: Address,
    pub amount: u64,
    pub released: bool,
}

#[contract]
pub struct AdaptiveEscrow;

#[contractimpl]
impl AdaptiveEscrow {
    /// Initialize storage (optional admin logic)
    pub fn initialize(_env: &Env) {}

    /// Create a new escrow
    pub fn create_escrow(env: &Env, client: Address, freelancer: Address, amount: u64) -> u32 {
        if amount == 0 {
            panic!("Amount must be positive");
        }

        // Get next ID
        let next_id = env.storage().persistent().get::<_, u32>(&Symbol::short("NEXT_ID")).unwrap_or(1);

        // Create escrow
        let escrow = Escrow {
            client: client.clone(),
            freelancer: freelancer.clone(),
            amount,
            released: false,
        };

        // Store escrow
        env.storage().persistent().set(&Symbol::short("ESCROW"), &escrow);

        // Update next ID
        env.storage().persistent().set(&Symbol::short("NEXT_ID"), &(next_id + 1));

        next_id
    }

    /// Release funds to freelancer
    pub fn release_funds(env: &Env, escrow_id: u32, caller: Address) {
        let mut escrow: Escrow = env.storage().persistent().get::<_, Escrow>(&Symbol::short("ESCROW")).expect("Escrow not found");

        if escrow.client != caller {
            panic!("Only client can release funds");
        }

        escrow.released = true;
        env.storage().persistent().set(&Symbol::short("ESCROW"), &escrow);
    }

    /// Get escrow details
    pub fn get_escrow(env: &Env, escrow_id: u32) -> Escrow {
        env.storage().persistent().get::<_, Escrow>(&Symbol::short("ESCROW")).expect("Escrow not found")
    }
}
