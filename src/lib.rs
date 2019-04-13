extern crate cfg_if;
extern crate wasm_bindgen;

mod utils;

use std::str;
use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;
use itertools::Itertools;

use bio::seq_analysis::gc;
use bio::io::fastq;

// -----------------------------------------------------------------------------
// Setup
// -----------------------------------------------------------------------------

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}


// -----------------------------------------------------------------------------
// Macros
// -----------------------------------------------------------------------------

macro_rules! stringify {
    ($vec:expr) => {
        $vec.iter()
            .map(ToString::to_string)
            .join(",")
    }
}

// macro_rules! stringify_avg {
//     ($vec:expr, $n_reads:expr) => {
//         $vec.iter()
//             .map(|x| { ( *x as f64 / $n_reads as f64).to_string() })
//             .join(",")
//     }
// }


// -----------------------------------------------------------------------------
// Function to export
// -----------------------------------------------------------------------------

#[wasm_bindgen]
pub fn fastq_metrics(seq: String) -> String
{
    // Per-read vectors
    let mut n_reads : u32 = 0;
    let mut hist_gc : Vec<f32> = Vec::new(); 
    let mut hist_len : Vec<usize> = Vec::new();

    // Per-position vectors
    let mut pos_a : Vec<u32> = Vec::new();
    let mut pos_c : Vec<u32> = Vec::new();
    let mut pos_g : Vec<u32> = Vec::new();
    let mut pos_t : Vec<u32> = Vec::new();
    let mut pos_n : Vec<u32> = Vec::new();
    let mut pos_qual : Vec<u32> = Vec::new();
    let mut pos_tot : Vec<u32> = Vec::new();

    // Loop through reads
    let reader = fastq::Reader::new(seq.as_bytes());
    for result in reader.records()
    {
        let record = result.unwrap();
        let sequence = record.seq();
        let qualities = record.qual();

        // Calculate stats
        let read_length = sequence.len();
        let read_gc = gc::gc_content(sequence);

        // Per-read stats
        n_reads += 1;
        hist_gc.push(read_gc);
        hist_len.push(read_length);

        // Per-position stats
        // TODO:
        for n in 0..read_length {
            if pos_qual.len() <= n {
                pos_qual.push(0);
                pos_tot.push(0);
                pos_a.push(0);
                pos_c.push(0);
                pos_g.push(0);
                pos_t.push(0);
                pos_n.push(0);
            }

            // Save quality
            pos_qual[n] += qualities[n] as u32 - 33;  // phred 33
            // Save base occurence
            match sequence[n] as char {
                'A' => { pos_a[n] += 1; },
                'C' => { pos_c[n] += 1; },
                'G' => { pos_g[n] += 1; },
                'T' => { pos_t[n] += 1; },
                'N' => { pos_n[n] += 1; },
                _ => {},
            }

            pos_tot[n] += 1;
        }
    }

    for i in 0..pos_qual.len() {
        pos_qual[i] = (100 * pos_qual[i]) / pos_tot[i] / 100;
        pos_a[i] = (100 * pos_a[i]) / pos_tot[i];
        pos_c[i] = (100 * pos_c[i]) / pos_tot[i];
        pos_g[i] = (100 * pos_g[i]) / pos_tot[i];
        pos_t[i] = (100 * pos_t[i]) / pos_tot[i];
        pos_n[i] = (100 * pos_n[i]) / pos_tot[i];
    }

    [
        n_reads.to_string(),
        "----------".to_string(),
        stringify!(hist_gc),
        "----------".to_string(),
        stringify!(hist_len),
        "----------".to_string(),

        stringify!(pos_qual),
        "----------".to_string(),
        stringify!(pos_a),
        "----------".to_string(),
        stringify!(pos_c),
        "----------".to_string(),
        stringify!(pos_g),
        "----------".to_string(),
        stringify!(pos_t),
        "----------".to_string(),
        stringify!(pos_n),
    ].join("\n")
}
