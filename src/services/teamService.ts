import { supabase } from '../lib/supabase';
import { StudyTeam } from '../types';

export function mapTeamFromDB(dbTeam: any, isJoined: boolean): StudyTeam {
  return {
    id: dbTeam.id,
    name: dbTeam.name,
    description: dbTeam.description || '',
    category: dbTeam.category,
    skillsRequired: dbTeam.skills_required || [],
    membersCount: Number(dbTeam.members_count || 0),
    maxMembers: Number(dbTeam.max_members || 10),
    joined: isJoined,
    imageColor: dbTeam.image_color || 'from-[#eaff00] to-yellow-400',
    createdBy: dbTeam.created_by || ''
  };
}

export async function fetchAllTeams(userId: string): Promise<StudyTeam[]> {
  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false });

  if (teamsError) throw teamsError;

  const { data: joinedData, error: joinedError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId);

  if (joinedError) throw joinedError;

  const joinedTeamIds = new Set((joinedData || []).map(item => item.team_id));

  return (teamsData || []).map(team => mapTeamFromDB(team, joinedTeamIds.has(team.id)));
}

export async function createTeam(
  teamData: Omit<StudyTeam, 'id' | 'membersCount' | 'joined'>,
  userId: string
): Promise<StudyTeam> {
  const { data: insertedTeam, error: teamError } = await supabase
    .from('teams')
    .insert({
      name: teamData.name,
      description: teamData.description,
      category: teamData.category,
      skills_required: teamData.skillsRequired,
      members_count: 1,
      max_members: teamData.maxMembers,
      image_color: teamData.imageColor,
      created_by: userId
    })
    .select('*')
    .single();

  if (teamError) throw teamError;

  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: insertedTeam.id,
      user_id: userId
    });

  if (memberError) throw memberError;

  return mapTeamFromDB(insertedTeam, true);
}

export async function joinTeam(teamId: string, userId: string): Promise<void> {
  const { error: joinError } = await supabase
    .from('team_members')
    .insert({ team_id: teamId, user_id: userId });

  if (joinError) throw joinError;

  const { data: team } = await supabase
    .from('teams')
    .select('members_count')
    .eq('id', teamId)
    .maybeSingle();

  if (team) {
    await supabase
      .from('teams')
      .update({ members_count: (team.members_count || 0) + 1 })
      .eq('id', teamId);
  }
}

export async function leaveTeam(teamId: string, userId: string): Promise<void> {
  const { error: leaveError } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  if (leaveError) throw leaveError;

  const { data: team } = await supabase
    .from('teams')
    .select('members_count')
    .eq('id', teamId)
    .maybeSingle();

  if (team) {
    await supabase
      .from('teams')
      .update({ members_count: Math.max(0, (team.members_count || 1) - 1) })
      .eq('id', teamId);
  }
}
