import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

// ── Constants ──────────────────────────────────────────────────────────────
const MEAL_TYPES = ["Breakfast", "Lunch", "Evening Snack", "Dinner", "Custom"];
const MEAL_ICONS = { Breakfast: "🌅", Lunch: "☀️", "Evening Snack": "🍎", Dinner: "🌙" };

// ── Primitives ─────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{children}</p>
);

const PrimaryBtn = ({ children, type = "button", onClick, disabled, className = "" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors ${className}`}
  >
    {children}
  </button>
);

const FieldInput = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50
      ${error
        ? "border-red-300 focus:ring-red-200 bg-red-50"
        : "border-gray-200 focus:ring-green-300 focus:border-green-400 hover:border-gray-300"
      }`}
  />
);

// ── AddMealForm Page ───────────────────────────────────────────────────────
export default function AddMeal({ onSave, onCancel }) {
  const [saved, setSaved] = useState(false);

  const {
    register, control, handleSubmit, watch, reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mealType: "Breakfast",
      customMealName: "",
      scheduledTime: "08:00",
      items: [{ name: "", qty: "", cal: "", protein: "", carbs: "", fat: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const mealType = watch("mealType");

  const onSubmit = (data) => {
    const mealName = data.mealType === "Custom" ? data.customMealName.trim() : data.mealType;
    if (!mealName) return;
    const meal = {
      name: mealName,
      icon: MEAL_ICONS[mealName] || "🍽️",
      scheduledTime: data.scheduledTime,
      items: data.items.map((i) => ({
        name: i.name, qty: i.qty,
        cal: +i.cal || 0, protein: +i.protein || 0,
        carbs: +i.carbs || 0, fat: +i.fat || 0,
      })),
    };
    onSave?.(meal);
    setSaved(true);
    setTimeout(() => { setSaved(false); reset(); }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4">
      <div className="w-full">

        {/* ── Page Header ── */}
       

        {/* ── Success Banner ── */}
        {saved && (
          <div className="mb-4 bg-green-500 text-white font-bold text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-green-100">
            ✅ Meal saved successfully!
          </div>
        )}

        {/* ── Form Card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Form Top Banner */}
          <div className="bg-[#1a2e1e] px-6 py-5">
            <p className="text-green-400 text-xs font-black uppercase tracking-widest mb-1">New Entry</p>
            <h2 className="text-white font-black text-xl">Meal Details</h2>
            <p className="text-gray-400 text-xs mt-1">Fill in the meal type, time and all food items</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-6 space-y-7">

              {/* ── Meal Type ── */}
              <section>
                <SectionLabel>Select Meal Type</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPES.map((type) => (
                    <label key={type} className="cursor-pointer">
                      <input type="radio" value={type} {...register("mealType")} className="sr-only" />
                      <span className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all select-none
                        ${mealType === type
                          ? "border-green-500 bg-green-500 text-white shadow-md shadow-green-100"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white hover:bg-gray-50"
                        }`}>
                        {MEAL_ICONS[type] && <span>{MEAL_ICONS[type]}</span>}
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* ── Custom Name ── */}
              {mealType === "Custom" && (
                <section>
                  <SectionLabel>Custom Meal Name</SectionLabel>
                  <FieldInput
                    error={errors.customMealName}
                    placeholder="e.g. Pre-Workout Snack"
                    {...register("customMealName", {
                      validate: (v) => mealType !== "Custom" || v.trim() !== "" || "Required",
                    })}
                  />
                  {errors.customMealName && (
                    <p className="text-red-500 text-xs mt-1.5 font-semibold">Please enter a meal name</p>
                  )}
                </section>
              )}

              {/* ── Scheduled Time ── */}
              <section>
                <SectionLabel>Scheduled Time</SectionLabel>
                <div className="flex items-center gap-4">
                  <input
                    type="time"
                    {...register("scheduledTime")}
                    className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300 w-40"
                  />
                  <p className="text-xs text-gray-400">Used to track early / late eating habits</p>
                </div>
              </section>

              {/* ── Food Items ── */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <SectionLabel>Food Items</SectionLabel>
                  <button
                    type="button"
                    onClick={() => append({ name: "", qty: "", cal: "", protein: "", carbs: "", fat: "" })}
                    className="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, i) => (
                    <div key={field.id} className="border border-gray-100 rounded-2xl p-5 bg-gray-50/70">

                      {/* Item Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-[#1a2e1e] text-white text-xs font-black flex items-center justify-center">
                            {i + 1}
                          </div>
                          <span className="text-xs font-bold text-gray-500">Food Item</span>
                        </div>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="text-xs font-bold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Name + Qty */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">Food Name *</label>
                          <FieldInput
                            error={errors.items?.[i]?.name}
                            placeholder="e.g. Oats with Milk"
                            {...register(`items.${i}.name`, { required: true })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">Quantity *</label>
                          <FieldInput
                            error={errors.items?.[i]?.qty}
                            placeholder="1 bowl"
                            {...register(`items.${i}.qty`, { required: true })}
                          />
                        </div>
                      </div>

                      {/* Nutrition Row */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { lbl: "Calories", key: "cal",     cls: "text-gray-600"  },
                          { lbl: "Protein",  key: "protein", cls: "text-blue-600"  },
                          { lbl: "Carbs",    key: "carbs",   cls: "text-amber-600" },
                          { lbl: "Fat",      key: "fat",     cls: "text-rose-500"  },
                        ].map(({ lbl, key, cls }) => (
                          <div key={key}>
                            <label className={`block text-[10px] font-black uppercase tracking-wide mb-1.5 ${cls}`}>{lbl}</label>
                            <FieldInput
                              type="number" min="0"
                              error={errors.items?.[i]?.[key]}
                              {...register(`items.${i}.${key}`, { required: true, min: 0 })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between rounded-b-3xl">
              <p className="text-xs text-gray-400">
                {fields.length} item{fields.length !== 1 ? "s" : ""} · All * fields required
              </p>
              <div className="flex items-center gap-3">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <PrimaryBtn type="submit">💾 Save Meal</PrimaryBtn>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}