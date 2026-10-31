-- old luatexbase API pieces that luatexja still calls (sandbox substitute)
local ltb = luatexbase
local whatsit_names = {}
function ltb.newuserwhatsitid(name, module)
  local full = (module or '') .. '.' .. (name or '')
  local id = ltb.new_whatsit(full)
  whatsit_names[id] = full
  return id
end
function ltb.get_user_whatsit_name(id)
  return whatsit_names[id] or ('unknown:' .. tostring(id))
end
ltb.base_add_to_callback = ltb.base_add_to_callback or ltb.add_to_callback
function ltb.reset_callback(name)
  local descs = ltb.callback_descriptions(name)
  for i = #descs, 1, -1 do ltb.remove_from_callback(name, descs[i]) end
end
function ltb.priority_in_callback(name, desc)
  if not desc then return false end
  for i, d in ipairs(ltb.callback_descriptions(name)) do
    if d == desc then return i end
  end
  return false
end
function ltb.is_active_callback(name, desc)
  return ltb.priority_in_callback(name, desc) and true or false
end
